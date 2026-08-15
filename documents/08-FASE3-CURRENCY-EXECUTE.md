# 08 - IMPLEMENTATION PLAN FASE 3: MULTI-TENANT CURRENCY SYSTEM (IDR/Rp vs MYR/RM) & ADMIN REPORTING ARCHITECTURE

Dokumen ini berisi arsitektur teknis, analisis mendalam, pemetaan komponen menyeluruh, serta rencana eksekusi untuk **FASE 3: Sistem Mata Uang & Format Harga Terpadu (Currency System)** dan **Penanganan Multi-Currency pada Dashboard Admin & Reporting**.

---

## 1. Ringkasan Fitur & Prinsip Arsitektur FASE 3

### A. Prinsip Utama (Coupled Language & Currency)
1. **Menyatu dengan Pengaturan Bahasa (Single-Language Single-Currency per Tenant):**
   - Jika Tenant memilih **🇮🇩 Bahasa Indonesia (`id`)** $\rightarrow$ Mata uang otomatis **`IDR` (Simbol: `Rp`, format integer ribuan tanpa desimal, misal: `Rp 50.000`)**.
   - Jika Tenant memilih **🇲🇾 Bahasa Melayu (`ms`)** $\rightarrow$ Mata uang otomatis **`MYR` (Simbol: `RM`, format standar finansial 2 desimal, misal: `RM 15.50` atau `RM 15.00`)**.
2. **Zero DB Schema Risk (Tanpa Migrasi Tabel SQL):**
   - Menggunakan kolom JSONB `theme_config` pada tabel `tenants` (`theme_config.currency`).
   - Menggunakan *smart fallback*: Jika `theme_config.currency` belum didefinisikan secara eksplisit, sistem otomatis menyimpulkan mata uang dari `theme_config.language || 'id'` (`id` $\rightarrow$ `IDR`, `ms` $\rightarrow$ `MYR`).
3. **Database Numerical Consistency:**
   - Tabel `orders`, `deposits`, `products`, `memberships`, dan `promo_codes` menyimpan nilai angka murni (`numeric` / `double precision`) tanpa simbol mata uang yang di-hardcode di database.
   - Angka nominal pada tenant Malaysia bernilai Ringgit (contoh: Diamond ML = `15.50`), sedangkan pada tenant Indonesia bernilai Rupiah (contoh: Diamond ML = `50000`).

---

## 2. Modul Utilitas Currency Terpusat (`src/lib/currencyUtils.ts`)

Seluruh pemformatan harga di aplikasi storefront, member portal, dan admin dashboard wajib menggunakan modul utilitas terpusat:

```typescript
import { Language } from "./dictionary";

export type Currency = "IDR" | "MYR";

/**
 * Mendapatkan Currency default berdasarkan Language
 */
export function getCurrencyFromLanguage(lang: Language = "id"): Currency {
  return lang === "ms" ? "MYR" : "IDR";
}

/**
 * Format angka ke format mata uang yang tepat (IDR vs MYR)
 * @param amount Nilai nominal angka
 * @param currency Mata uang ("IDR" | "MYR")
 * @param options Opsi kustomisasi format
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: Currency = "IDR",
  options?: {
    showSymbol?: boolean;
    spaceAfterSymbol?: boolean;
  }
): string {
  const numericAmount = Number(amount) || 0;
  const showSymbol = options?.showSymbol ?? true;
  const space = options?.spaceAfterSymbol ?? true ? " " : "";

  if (currency === "MYR") {
    const formatted = numericAmount.toLocaleString("ms-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return showSymbol ? `RM${space}${formatted}` : formatted;
  }

  // Default: IDR
  const formatted = Math.round(numericAmount).toLocaleString("id-ID");
  return showSymbol ? `Rp${space}${formatted}` : formatted;
}

/**
 * Pilihan Preset Nominal Deposit yang disesuaikan dengan skala mata uang
 */
export function getDepositNominalOptions(currency: Currency = "IDR"): number[] {
  if (currency === "MYR") {
    return [5, 10, 20, 50, 100, 200, 500, 1000];
  }
  return [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];
}

/**
 * Nilai Minimal Deposit sesuai mata uang
 */
export function getMinDepositAmount(currency: Currency = "IDR"): number {
  return currency === "MYR" ? 5 : 10000;
}
```

---

## 3. Pemetaan Lengkap Seluruh Komponen yang Menggunakan Format Mata Uang

Berikut adalah inventarisasi seluruh file yang memiliki teks statis `Rp`, `toLocaleString('id-ID')`, atau format harga, yang akan direfaktor ke `formatCurrency(amount, currency)`:

### A. Storefront (Beranda, Katalog, & Detail Game)
| File | Lokasi Elemen | Kondisi Sebelum | Kondisi Target FASE 3 |
| :--- | :--- | :--- | :--- |
| `src/components/storefront/FlashSaleSection.tsx` | Kartu Flash Sale (Harga Diskon & Asli) | `{item.discountPrice.toLocaleString('id-ID')}` & `Rp {item.originalPrice}` | `formatCurrency(item.discountPrice, currency)` & `formatCurrency(item.originalPrice, currency)` |
| `src/components/storefront/PopularSection.tsx` | Label "Mulai dari" | `Mulai dari Rp ...` | `Mulai dari formatCurrency(minPrice, currency)` |
| `src/app/[domain]/prices/PricesClient.tsx` | Tabel Daftar Harga (`/prices`) | `formatIDR(price)` | `formatCurrency(price, currency)` |
| `src/components/storefront/StorefrontGameForm.tsx` | 1. Kartu Produk / Nominal | `Rp {p.price.toLocaleString('id-ID')}` | `formatCurrency(p.price, currency)` |
| `src/components/storefront/StorefrontGameForm.tsx` | 2. Info Saldo Dompet | `Saldo Anda: Rp ...` & `(Kurang Rp ...)` | `Saldo Anda: formatCurrency(walletBalance, currency)` |
| `src/components/storefront/StorefrontGameForm.tsx` | 3. Floating Bottom Bar | `Rp {totalPrice.toLocaleString('id-ID')}` | `formatCurrency(totalPrice, currency)` |
| `src/components/storefront/StorefrontGameForm.tsx` | 4. Modal Konfirmasi Pesanan | `Rp {totalPrice.toLocaleString('id-ID')}` | `formatCurrency(totalPrice, currency)` |
| `src/components/storefront/StorefrontGameForm.tsx` | 5. Badge Diskon | `Diskon Rp ...` | `Diskon formatCurrency(p.discount_value, currency)` |

### B. Transaksi, Checkout, Invoice & Tracking
| File | Lokasi Elemen | Kondisi Sebelum | Kondisi Target FASE 3 |
| :--- | :--- | :--- | :--- |
| `src/app/[domain]/checkout/[id]/CheckoutClient.tsx` | Ringkasan Tagihan (Harga Asli, Diskon, Biaya Admin, Total) | `Rp {Number(order.total_price)...}` | `formatCurrency(order.total_price, currency)` |
| `src/app/[domain]/checkout/[id]/CheckoutClient.tsx` | Template Pesan Konfirmasi WhatsApp | `- Total: *Rp ...*` | `- Total: *${formatCurrency(order.total_price, currency)}*` |
| `src/app/[domain]/deposit-checkout/[id]/DepositCheckoutClient.tsx` | Ringkasan Transfer Deposit | `Rp {Number(deposit.amount)...}` | `formatCurrency(deposit.amount, currency)` |
| `src/app/[domain]/deposit-checkout/[id]/DepositCheckoutClient.tsx` | Template Pesan Konfirmasi Deposit WA | `- Total Biaya: *Rp ...*` | `- Total Biaya: *${formatCurrency(deposit.amount, currency)}*` |
| `src/app/[domain]/track/TrackClient.tsx` | Kartu Hasil Lacak Pesanan | `Rp {Number(order.total_price)...}` | `formatCurrency(order.total_price, currency)` |

### C. Member Portal & Dompet Saldo
| File | Lokasi Elemen | Kondisi Sebelum | Kondisi Target FASE 3 |
| :--- | :--- | :--- | :--- |
| `src/components/storefront/Header.tsx` & `UserDropdown.tsx` | Dropdown Saldo Akun Pengguna | `{balance.toLocaleString('id-ID')}` | `formatCurrency(balance, currency)` |
| `src/components/storefront/MobileSidebar.tsx` | Sidebar Mobile Info Saldo | `Rp {balance.toLocaleString('id-ID')}` | `formatCurrency(balance, currency)` |
| `src/app/[domain]/member/dashboard/page.tsx` | 1. Kartu Saldo Dompet | `Rp {currentBalance.toLocaleString('id-ID')}` | `formatCurrency(currentBalance, currency)` |
| `src/app/[domain]/member/dashboard/page.tsx` | 2. Total Pengeluaran / Transaksi | `Rp {totalSpent.toLocaleString('id-ID')}` | `formatCurrency(totalSpent, currency)` |
| `src/app/[domain]/member/dashboard/DashboardHistoryClient.tsx` | Kolom HARGA di Tabel Riwayat | `Rp {Number(price).toLocaleString('id-ID')}` | `formatCurrency(price, currency)` |
| `src/app/[domain]/member/deposit/page.tsx` | Kartu Saldo Saat Ini | `Rp {currentBalance.toLocaleString('id-ID')}` | `formatCurrency(currentBalance, currency)` |
| `src/components/storefront/DepositForm.tsx` | 1. Pilihan Nominal Preset | Hardcoded 10k - 2Jt | Dinamis: `getDepositNominalOptions(currency)` (MYR: RM 5 - RM 1000) |
| `src/components/storefront/DepositForm.tsx` | 2. Validasi Minimum Deposit | Hardcoded `Rp 10.000` | Dinamis: `getMinDepositAmount(currency)` (MYR: `RM 5`) |
| `src/components/storefront/DepositForm.tsx` | 3. Floating Bar & Modal Konfirmasi | `Rp {amount.toLocaleString('id-ID')}` | `formatCurrency(amount, currency)` |
| `src/app/[domain]/member/transactions/RiwayatTransaksiClient.tsx` | Kolom TOTAL BAYAR Tabel Pesanan | `Rp {Number(order.total_price)...}` | `formatCurrency(order.total_price, currency)` |
| `src/app/[domain]/member/deposits/RiwayatDepositClient.tsx` | Kolom JUMLAH DEPOSIT Tabel Mutasi | `Rp {Number(dep.amount)...}` | `formatCurrency(dep.amount, currency)` |
| `src/app/[domain]/member/upgrade/UpgradeClient.tsx` | 1. Harga Paket Membership | `Rp {price.toLocaleString('id-ID')} / bln` | `${formatCurrency(price, currency)} / bln` |
| `src/app/[domain]/member/upgrade/UpgradeClient.tsx` | 2. Opsi Bayar Saldo Dompet & Selisih | `Saldo: Rp ...` & `Kurang Rp ...` | `${formatCurrency(walletBalance, currency)}` |

---

## 4. Analisis Mendalam: Penanganan Multi-Currency pada Dashboard Admin & Reporting

### A. Arsitektur Multi-Tenant Backoffice NGS
Di Backoffice Admin NewGamingStore, sistem bekerja dengan konsep **Active Tenant Context** (`getActiveAdminTenantId()`):
1. **Operator Admin:** Selalu terikat pada `tenant_id` tertentu (misal: Toko Malaysia).
2. **Superadmin:** Dapat berpindah konteks tenant secara instan melalui `TenantSelector` (tersimpan pada cookie `admin_tenant_id`).

### B. Tantangan & Celah Fatal Reporting Multi-Mata Uang
> [!CAUTION]
> **Larangan Agregasi Naif:**
> Menjumlahkan `total_price` dari pesanan Indonesia (contoh: `Rp 500.000`) dengan pesanan Malaysia (contoh: `RM 150.00`) secara langsung (`500.000 + 150 = 500.150`) akan menghasilkan **metrik sampah (*garbage data*)** yang merusak laporan keuangan.

### C. Solusi Best-Practice Penanganan Reporting Admin

#### 1. Tenant-Context-Aware Metric Card (Single-Tenant Dashboard View)
Pada Dashboard Utama Admin (`/admin/page.tsx`):
- Sistem mengambil data `theme_config` dari tenant yang sedang aktif (`currentTenantId`).
- `currency` ditentukan dari `tenant.theme_config.currency || getCurrencyFromLanguage(tenant.theme_config.language)`.
- Metrik Finansial diformat dinamis:
  - **Tenant Indonesia:** `Total Omset Lunas (PAID)` $\rightarrow$ `Rp 12.500.000`
  - **Tenant Malaysia:** `Total Omset Lunas (PAID)` $\rightarrow$ `RM 3,450.50`

```typescript
// Contoh di src/app/admin/(authenticated)/page.tsx
const tenantCurrency = tenantData?.theme_config?.currency || 
  getCurrencyFromLanguage(tenantData?.theme_config?.language);

// Pada Card Omset:
<div className="text-3xl font-extrabold text-foreground tracking-tight">
  {formatCurrency(stats.paidVolume, tenantCurrency)}
</div>
```

#### 2. Segregated Multi-Currency Reporting (Superadmin Global Overview)
Jika SuperAdmin memilih opsi "Semua Tenant" (All Tenants View) untuk melihat performa global platform:
- Sistem mengelompokkan omset berdasarkan mata uang masing-masing tenant (`GROUP BY currency`):
  - **Total Volume IDR:** `Rp 158.450.000` (dari 342 transaksi IDR)
  - **Total Volume MYR:** `RM 14.850,20` (dari 88 transaksi MYR)
- **Keunggulan:** 100% akurat secara akuntansi, tanpa perlu mengintegrasikan Third-Party Currency Conversion API yang fluktuatif dan berisiko selisih kurs.

#### 3. Standardisasi Seluruh Tabel Manajemen Admin
Seluruh tabel backoffice admin yang memuat kolom harga/nominal wajib mengadopsi `currency` tenant aktif:
- **Tabel Pesanan (`/admin/orders`):** Kolom Total Bayar menampilkan `formatCurrency(order.total_price, currency)`.
- **Tabel Deposit (`/admin/deposits`):** Kolom Jumlah Deposit menampilkan `formatCurrency(deposit.amount, currency)`.
- **Tabel Produk (`/admin/products`):** Kolom Harga Jual & Modal menampilkan `formatCurrency(product.price, currency)`.
- **Tabel Membership (`/admin/memberships`):** Kolom Biaya Paket menampilkan `formatCurrency(pkg.price, currency)`.
- **Tabel Promo Codes (`/admin/promos`):** Kolom Diskon Nominal menampilkan `formatCurrency(promo.discount_value, currency)`.

### D. Penanganan Kasus Khusus: Tenant Berpindah Mata Uang (Currency Switching & Historical Integrity)

Skenario arsitektur nyata: *Bagaimana jika suatu saat tenant yang awalnya beroperasi dengan `MYR` (Ringgit) memutuskan berganti mata uang ke `IDR` (Rupiah), atau sebaliknya?*

#### 1. Masalah / Anomali Finansial Jika Tanpa Mitigasi
Jika sistem hanya membaca konfigurasi mata uang aktif saat ini (`theme_config.currency`), akan timbul 3 anomali fatal:
1. **Distorsi Agregasi Omset:** Transaksi lama RM 100 + transaksi baru Rp 50.000 dijumlahkan secara naif menjadi `50.100`, lalu diformat menjadi `Rp 50.100` (padahal RM 100 bernilai riil ~Rp 350.000).
2. **Kekeliruan Riwayat Transaksi:** Transaksi masa lalu berlabel RM 15.50 akan salah diformat menjadi `Rp 16` atau `Rp 15.50` sehingga tidak cocok dengan struk/bukti bayar pelanggan.
3. **Anomali Saldo Dompet:** Saldo member yang tersisa RM 50 akan terbaca menjadi `Rp 50`.

#### 2. Solusi Arsitektural: *Historical Currency Tagging (Snapshot Pattern)*
Mengikuti standar industri (seperti Stripe / Shopify) untuk menjamin *Immutability of Financial Records*:
- **Penyematan Snapshot Transaksi:** Setiap transaksi baru (`orders` dan `deposits`) wajib menyertakan snapshot `currency` saat dibuat (disimpan pada kolom transaksi atau JSONB `metadata: { currency: "MYR" }`).
- **Integritas Historis:** Transaksi yang terjadi saat mode MYR akan selamanya tercatat sebagai MYR, dan transaksi baru saat mode IDR tercatat sebagai IDR.

#### 3. Tampilan Cerdas di Dashboard Admin (Smart Multi-Currency Aggregation)
Saat Dashboard Admin (`/admin/page.tsx`) memuat data omset tenant:
- Sistem mengagregasi omset per mata uang (`GROUP BY currency`):
  - **Skenario Normal (1 Mata Uang):** Menampilkan 1 Card Omset Standar (misal: `Total Omset Lunas: Rp 150.000.000`).
  - **Skenario Multi-Currency (Pernah Ganti Mata Uang):** Dashboard otomatis menyajikan **Multi-Currency Breakdown**:
    - **Total Omset Lunas (IDR):** `Rp 200.000.000` *(Mata Uang Aktif)*
    - **Total Omset Historis (MYR):** `RM 4,500.00` *(Mata Uang Sebelumnya)*
- **Tabel Riwayat Pesanan & Mutasi:** Setiap baris diformat sesuai mata uang snapshot transaksinya (`formatCurrency(row.total_price, row.currency)`). Baris pesanan lama tetap tampil `RM 15.50 🇲🇾` dan pesanan baru tampil `Rp 50.000 🇮🇩`.

#### 4. Safety Warning Modal saat Ganti Mata Uang di Backoffice (`/admin/theme`)
Saat admin/operator mengubah pengaturan mata uang di menu Theme & Branding, sistem menampilkan dialog konfirmasi keamanan:
> ⚠️ **Peringatan Perubahan Mata Uang Toko:**  
> Anda akan mengubah mata uang toko dari **MYR** ke **IDR**.  
> - *Transaksi historis* akan tetap tersimpan dalam **MYR** dan dilaporkan secara terpisah.  
> - *Harga produk pada katalog* tidak otomatis terkonversi kurs. Anda disarankan memperbarui harga nominal produk ke satuan Rupiah pada menu **Produk**.  
> Apakah Anda yakin ingin melanjutkan?

---

## 5. Sinkronisasi UI Pengaturan pada Backoffice (`/admin/theme`)

Pada halaman Backoffice Theme & Branding (`src/app/admin/(authenticated)/theme/ThemeClient.tsx`), bagian pengaturan bahasa diperkaya untuk menginformasikan keterikatan mata uang secara jelas dan visual:

```tsx
<Card className="shadow-sm">
  <CardHeader>
    <CardTitle>Bahasa & Mata Uang Storefront</CardTitle>
    <CardDescription>
      Pilih bahasa utama dan mata uang operasional untuk etalase toko Anda.
    </CardDescription>
  </CardHeader>
  <CardContent className="grid grid-cols-2 gap-4">
    {/* Pilihan Indonesia */}
    <div 
      className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all relative ${
        language === 'id' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
      onClick={() => {
        setLanguage('id');
        setCurrency('IDR');
      }}
    >
      {language === 'id' && <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />}
      <div className="text-4xl mb-2">🇮🇩</div>
      <p className="font-semibold text-center text-sm">Indonesia (ID)</p>
      <span className="text-[11px] text-muted-foreground mt-1 bg-white/5 px-2 py-0.5 rounded-full">
        Mata Uang: <strong>Rupiah (Rp / IDR)</strong>
      </span>
    </div>

    {/* Pilihan Malaysia */}
    <div 
      className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all relative ${
        language === 'ms' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
      onClick={() => {
        setLanguage('ms');
        setCurrency('MYR');
      }}
    >
      {language === 'ms' && <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />}
      <div className="text-4xl mb-2">🇲🇾</div>
      <p className="font-semibold text-center text-sm">Malaysia (MS)</p>
      <span className="text-[11px] text-muted-foreground mt-1 bg-white/5 px-2 py-0.5 rounded-full">
        Mata Uang: <strong>Ringgit (RM / MYR)</strong>
      </span>
    </div>
  </CardContent>
</Card>
```

---

## 6. Rencana Eksekusi Teknis Bertahap (FASE 3 Action Roadmap)

### Tahap 1: Utilitas Terpusat & Type Definition
1. **[NEW] `src/lib/currencyUtils.ts`**:
   - Membuat fungsi `formatCurrency`, `getCurrencyFromLanguage`, `getDepositNominalOptions`, dan `getMinDepositAmount`.
2. **[MODIFY] `src/lib/themeUtils.ts`**:
   - Memastikan `ThemeConfig` memuat `currency?: Currency` dan helper `getThemeConfigOrDefault` mengembalikan currency yang valid.
3. **[MODIFY] `src/lib/tenantAuth.ts`**:
   - Memastikan `TenantAuthConfig` menyertakan `currency: Currency` yang diekstrak dari `theme_config`.

### Tahap 2: Sinkronisasi Backoffice Theme & Branding
1. **[MODIFY] `src/app/admin/(authenticated)/theme/ThemeClient.tsx`**:
   - Menghubungkan state `currency` dengan pilihan `language` (ID $\rightarrow$ IDR, MS $\rightarrow$ MYR).
   - Memperbarui kartu visual selector dengan label mata uang.

### Tahap 3: Storefront & Katalog Refactoring
1. **[MODIFY] `src/components/storefront/FlashSaleSection.tsx`**: Gunakan `formatCurrency`.
2. **[MODIFY] `src/components/storefront/PopularSection.tsx`**: Gunakan `formatCurrency`.
3. **[MODIFY] `src/app/[domain]/prices/PricesClient.tsx`**: Ganti `formatIDR` dengan `formatCurrency`.
4. **[MODIFY] `src/components/storefront/StorefrontGameForm.tsx`**: Refactor seluruh harga nominal, saldo dompet, diskon, dan review tagihan.

### Tahap 4: Checkout, Deposit, & Tracking Flow
1. **[MODIFY] `src/app/[domain]/checkout/[id]/CheckoutClient.tsx`**: Format tagihan invoice dan pesan WhatsApp dengan `formatCurrency`.
2. **[MODIFY] `src/app/[domain]/deposit-checkout/[id]/DepositCheckoutClient.tsx`**: Format nominal deposit dan pesan WA.
3. **[MODIFY] `src/app/[domain]/track/TrackClient.tsx`**: Format total bayar pesanan.

### Tahap 5: Member Portal & Wallet
1. **[MODIFY] `src/components/storefront/Header.tsx`, `UserDropdown.tsx`, `MobileSidebar.tsx`**: Tampilkan saldo dompet dengan currency yang tepat.
2. **[MODIFY] `src/app/[domain]/member/dashboard/page.tsx` & `DashboardHistoryClient.tsx`**: Tampilkan saldo, total belanja, dan harga riwayat dengan `formatCurrency`.
3. **[MODIFY] `src/app/[domain]/member/deposit/page.tsx` & `src/components/storefront/DepositForm.tsx`**:
   - Gunakan nominal preset dinamis (10k-2M untuk IDR vs RM5-1000 untuk MYR).
   - Validasi minimum deposit dinamis (Rp 10.000 vs RM 5).
4. **[MODIFY] `src/app/[domain]/member/transactions/RiwayatTransaksiClient.tsx`**: Format kolom total bayar.
5. **[MODIFY] `src/app/[domain]/member/deposits/RiwayatDepositClient.tsx`**: Format kolom jumlah deposit.
6. **[MODIFY] `src/app/[domain]/member/upgrade/UpgradeClient.tsx`**: Format harga paket membership dan saldo dompet.

### Tahap 6: Admin Dashboard & Reporting
1. **[MODIFY] `src/app/admin/(authenticated)/page.tsx`**: Ambil currency dari tenant aktif dan format omset (PAID & PENDING) sesuai currency.
2. **[MODIFY] `src/app/admin/(authenticated)/orders/OrderListClient.tsx`**: Format kolom harga pesanan.
3. **[MODIFY] `src/app/admin/(authenticated)/deposits/AdminDepositsClient.tsx`**: Format kolom nominal deposit.
4. **[MODIFY] `src/app/admin/(authenticated)/products/ProductsClient.tsx`**: Format harga jual & harga asli produk.
5. **[MODIFY] `src/app/admin/(authenticated)/memberships/AdminMembershipsClient.tsx`**: Format harga paket membership.
6. **[MODIFY] `src/app/admin/(authenticated)/promos/PromosClient.tsx`**: Format diskon nominal promo.

### Tahap 7: Verifikasi & QA
1. Uji ganti bahasa ke `id` $\rightarrow$ Pastikan seluruh storefront, member portal, dan admin menampilkan `Rp 50.000`.
2. Uji ganti bahasa ke `ms` $\rightarrow$ Pastikan seluruh storefront, member portal, dan admin menampilkan `RM 15.50` / `RM 15.00`.
3. Validasi kompilasi TypeScript (`npx tsc --noEmit`) dengan 0 error.
