# 12 - ARSITEKTUR & ANALISIS KRITIS MULTI-CURRENCY & MULTI-REGION (IDR, MYR, SGD)

Dokumen ini berisi analisis teknis mendalam, evaluasi kritis terhadap opsi perancangan sistem, serta arsitektur terbaik (*Best Practices*) untuk mendukung **Multi-Currency & Multi-Region (IDR, MYR, SGD)** per tenant di platform gaming store.

---

## 1. Latar Belakang & Kebutuhan Bisnis

Sebelumnya, platform mengadopsi model **Single-Currency per Tenant** (satu tenant hanya dapat memilih 1 mata uang statis antara `IDR` atau `MYR` di `theme_config`).

Kebutuhan bisnis baru menuntut arsitektur **Multi-Currency & Multi-Region Dinamis**:
1. **Dinamis per Tenant**: Tenant dapat memilih untuk beroperasi dalam 1 mata uang (misal: IDR saja), 2 mata uang (misal: MYR + SGD), atau 3 mata uang sekaligus (IDR + MYR + SGD).
2. **Visitor Currency Switcher**: Pengunjung toko (*storefront*) dapat memilih mata uang di Navbar (🇮🇩 IDR, 🇲🇾 MYR, 🇸🇬 SGD).
3. **Katalog & Harga Adaptif**:
   - **Harga Produk**: Berubah sesuai nominal mata uang yang dipilih (misal: 86 Diamond = Rp 20.000 / RM 5.50 / S$ 1.80).
   - **Ketersediaan Game (Region Filter)**: Game yang tidak aktif di region tertentu (misal: Game khusus server Indo) tidak ditampilkan saat pengunjung memilih SGD/MYR.
   - **Kanal Pembayaran (Payment Channels)**: Menampilkan metode pembayaran lokal yang relevan (IDR = QRIS/BCA; MYR = DuitNow/FPX; SGD = PayNow/GrabPay SG; Wallet = Semua).
   - **Kontak CS WhatsApp**: Mengarahkan pengunjung ke nomor CS lokal yang sesuai dengan negara/region terkait.

---

## 2. Analisis Kritis & Evaluasi Opsi Perancangan

Berikut adalah evaluasi kritis dari opsi-opsi yang dibahas dalam tahap brainstorming:

### A. Evaluasi Penyimpanan Harga Produk (`products` table)

| Kriteria | Opsi A: Kolom Statis (`price_idr`, `price_myr`, `price_sgd`) | Opsi B: Tabel Relasional (`product_prices`) | Opsi C: Kolom JSONB (`prices` & `original_prices`) **(TERPILIH)** |
| :--- | :--- | :--- | :--- |
| **Fleksibilitas Tambah Currency (USD/THB/PHP)** | 🔴 Rendah (Wajib migrasi DDL kolom SQL baru) | 🟢 Sangat Tinggi | 🟢 **Sangat Tinggi (Cukup tambah key JSON)** |
| **Backward Compatibility** | 🟡 Sedang (Harus refaktor seluruh query) | 🔴 Rendah (Memerlukan refaktor total query JOIN) | 🟢 **Sempurna (Kolom `price` lama tetap jadi default fallback)** |
| **Performa Query & Latency** | 🟢 Cepat (1 query) | 🟡 Sedang (JOIN antar tabel) | 🟢 **Sangat Cepat (1 query tanpa JOIN)** |
| **Integritas Tipe Data** | 🟢 Validasi tipe data SQL | 🟢 Foreign Key & Unique Constraint | 🟡 Perlu validasi ketat via Zod Schema di Server Action |

> **Keputusan Terbaik (Best Practice)**:
> Menggunakan **Opsi C (Kolom JSONB `prices` & `original_prices`)** dengan tetap mempertahankan kolom `price` sebagai fallback nilai dasar. Pendekatan ini menjaga performa Next.js tetap maksimal tanpa query JOIN berlebih dan mencegah kerusakan (*breaking changes*) pada data tenant yang sudah berjalan.

---

### B. Evaluasi Filter Region Game (`games` table)

- **Opsi Terpilih**: Menambahkan kolom `supported_currencies TEXT[] DEFAULT '{IDR,MYR,SGD}'`.
- **Kritisi Teknis**:
  - PostgreSQL Array `TEXT[]` didukung secara native oleh Supabase dan SQL standard.
  - Query filtering: `WHERE 'SGD' = ANY(supported_currencies) OR supported_currencies IS NULL`.
  - Di level aplikasi (Client/Server), array filter bekerja dengan kecepatan 0ms in-memory.

---

### C. Evaluasi Kanal Pembayaran (`payment_channels` table)

- **Opsi Terpilih**: Menambahkan kolom `supported_currencies TEXT[] DEFAULT '{IDR}'`.
- **Alasan**:
  - Kanal pembayaran seperti QRIS/BCA hanya berlaku untuk `IDR`.
  - Kanal pembayaran seperti DuitNow/Touch 'n Go hanya untuk `MYR`.
  - Kanal pembayaran PayNow/DBS hanya untuk `SGD`.
  - Kanal internal seperti **Saldo Akun / Wallet** dapat mendukung `['IDR', 'MYR', 'SGD']`.

---

### D. Evaluasi State Management Mata Uang Pengunjung (Storefront)

- **Kritisi SSR & Caching**:
  - Jika mata uang hanya disimpan di `localStorage`, Server Component (SSR) tidak dapat merender harga yang tepat pada *initial load*, yang akan menyebabkan *hydration mismatch*.
- **Solusi Arsitektur**:
  1. Simpan mata uang aktif di **Cookie `storefront_currency`** dengan masa aktif 30 hari.
  2. Server Component (`layout.tsx` / `page.tsx`) membaca cookie via `cookies().get('storefront_currency')`.
  3. Jika cookie belum ada, sistem menggunakan `tenant.theme_config.default_currency || 'IDR'`.
  4. Ketika pengunjung mengganti mata uang di Navbar, cookie diperbarui dan halaman melakukan refresh state yang mulus.

---

### E. Integritas Transaksi & Riwayat Pesanan (`orders` & `deposits`)

- **Kritisi Finansial**:
  - Jika harga produk berubah atau kurs berfluktuasi, transaksi masa lalu tidak boleh terpengaruh.
- **Solusi Mutlak**:
  - Tabel `orders` dan `deposits` **wajib menyimpan kolom `currency`** (contoh: `currency: 'SGD'`, `total_price: 1.80`).
  - Invoice dan tanda terima pesanan akan selalu membaca mata uang yang terkunci saat pesanan dibuat.

---

## 3. Diagram Arsitektur Multi-Currency

```mermaid
graph TD
    subgraph "1. Tenant Configuration"
        TC[Tenants Table: theme_config] --> |"multi_currency_enabled: true<br>supported_currencies: [IDR, MYR, SGD]"| CFG[Tenant Config Engine]
    end

    subgraph "2. Visitor Entry"
        USR[Visitor] -->|Select Currency: SGD| NAV[Navbar Switcher]
        NAV -->|Set Cookie| CK[Cookie: storefront_currency=SGD]
        CK --> SSR[Server / SSR Layout]
    end

    subgraph "3. Dynamic Filtering & Pricing"
        SSR --> GMF[Games Filter: supported_currencies @> SGD]
        SSR --> PRD[Products Pricing: prices->>'SGD']
        SSR --> PMF[Payment Filter: supported_currencies @> SGD]
        SSR --> WAF[WhatsApp CS: whatsapp_contacts['SGD']]
    end

    subgraph "4. Checkout & Ledger"
        PRD --> ORD[Orders Table: currency='SGD', total_price=1.80]
        PMF --> CHK[Checkout PayNow SGD]
    end
```

---

## 4. Pembagian Fase Implementasi

Migrasi ini dipecah menjadi 4 dokumen fase terpisah yang terperinci:

1. **`documents/13-FASE1-DB-SCHEMA-MULTI-CURRENCY.md`**:
   - DDL SQL Migrations, struktur tabel, default value, dan skrip migrasi data lama.
2. **`documents/14-FASE2-STOREFRONT-MULTI-CURRENCY.md`**:
   - Komponen Navbar Currency Selector, format mata uang SGD di `currencyUtils.ts`, katalog game adaptif, dan dynamic CS WhatsApp.
3. **`documents/15-FASE3-ADMIN-MULTI-CURRENCY-MANAGEMENT.md`**:
   - BO Operator Admin UI (Pengaturan Multi-Currency Tenant, Form Produk Multi-Harga, Checklist Region Game, Manajemen Payment Channels).
4. **`documents/16-FASE4-CHECKOUT-TRANSACTIONS-AUDIT.md`**:
   - Alur Checkout & Payment Gateway per mata uang, isolasi saldo deposit, riwayat transaksi, dan protokol pengujian komprehensif.
