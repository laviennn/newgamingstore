# 05 - MULTI-TENANT THEME PRESETS, LANGUAGE & CURRENCY SYSTEM

Dokumen ini mendokumentasikan spesifikasi arsitektur dan panduan implementasi untuk 3 fitur kustomisasi Multi-Tenant pada Backoffice (BO) Admin:
1. **Preset Tema Storefront** (Default Dark Blue vs Emerald Theme)
2. **Pengaturan Bahasa Single-Language per Tenant** (ID - Bahasa Indonesia vs MS - Bahasa Melayu / Malaysia)
3. **Pengaturan Format Mata Uang** (IDR / Rp vs MYR / RM)

---

## 1. Skema Data (`theme_config` pada tabel `tenants`)

Seluruh variabel konfigurasi disimpan secara terisolasi per-tenant pada kolom `theme_config` (JSONB) di tabel `tenants`:

```json
{
  "themePreset": "default", // "default" | "emerald"
  "language": "id",         // "id" | "ms"
  "currency": "IDR",        // "IDR" | "MYR"
  "colors": {
    "primary": "#2563eb",
    "background": "#0a0f1d",
    "card": "#1c2333",
    "text": "#ffffff"
  }
}
```

---

## 2. Preset Tema (Theme Presets)

BO Operator dapat memilih preset tema dari Backoffice Admin (`/admin/theme`). Memilih preset akan otomatis mengisi palet warna dasar, tetapi BO Operator tetap memiliki opsi kustomisasi warna HEX individual.

### Daftar Preset Tema
1. **Default Theme (Classic Neon Dark Blue):**
   - `primary`: `#2563eb` (Royal Blue Neon)
   - `background`: `#0a0f1d` (Deep Dark Blue)
   - `card`: `#1c2333` (Slate Dark)
   - `text`: `#ffffff`
2. **Emerald Theme (Cyber Emerald & Luxury Green):**
   - `primary`: `#10b981` (Emerald Cyber Green)
   - `background`: `#06120e` (Dark Emerald Velvet)
   - `card`: `#0e221b` (Emerald Glass)
   - `text`: `#ffffff`

---

## 3. Sistem Bahasa Storefront (Single-Language per Tenant)

Storefront **BUKAN** multi-language switcher bagi pengunjung. Bahasa storefront murni dikontrol dari Admin BO per-tenant (*Single Language per Tenant*).

### File Dictionary (`src/lib/dictionary.ts`)
Modul kamus bahasa terpusat yang dipanggil di komponen storefront:

```typescript
export type Language = "id" | "ms";

export const dictionaries = {
  id: {
    account_data: "Masukkan Data Akun Kamu",
    select_nominal: "Pilih Nominal Top Up",
    select_payment: "Pilih Metode Pembayaran",
    contact_detail: "Detail Kontak",
    enter_wa: "No. WhatsApp",
    checkout_btn: "Bayar Sekarang",
    search_placeholder: "Cari Game...",
    promo_code: "Kode Promo",
    payment_proof: "Upload Bukti Transfer",
    check_invoice: "Lacak Pesanan",
    order_status: "Status Pesanan",
    account_name: "A.N (Atas Nama)",
    account_number: "Nomor Rekening",
  },
  ms: {
    account_data: "Masukkan Maklumat Akaun Anda",
    select_nominal: "Pilih Nilai Topup",
    select_payment: "Pilih Kaedah Pembayaran",
    contact_detail: "Maklumat Hubungan",
    enter_wa: "No. WhatsApp / Telefon",
    checkout_btn: "Bayar Sekarang",
    search_placeholder: "Cari Permainan...",
    promo_code: "Kod Promo",
    payment_proof: "Muat Naik Bukti Pembayaran",
    check_invoice: "Semak Pesanan",
    order_status: "Status Pesanan",
    account_name: "Atas Nama Akaun",
    account_number: "Nombor Akaun / E-Wallet",
  },
};

export function getDictionary(lang: Language = "id") {
  return dictionaries[lang] || dictionaries.id;
}
```

---

## 4. Sistem Mata Uang & Format Harga (Currency System)

Format penulisan harga pada seluruh komponen storefront (katalog, checkout, deposit, invoice, header) menggunakan utilitas terpusat:

### File Currency Utility (`src/lib/currencyUtils.ts`)

```typescript
export type Currency = "IDR" | "MYR";

export function formatCurrency(
  amount: number,
  currency: Currency = "IDR"
): string {
  const numericAmount = Number(amount) || 0;

  if (currency === "MYR") {
    return `RM ${numericAmount.toLocaleString("ms-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `Rp ${Math.round(numericAmount).toLocaleString("id-ID")}`;
}
```

---

## 5. Alur Pengaturan di Backoffice Admin (`/admin/theme`)

1. **Seksi Theme Preset:**
   - Radio / Button Card pilihan preset: `[ Default Theme ]` vs `[ Emerald Theme ]`.
   - Menampilkan warna `Primary`, `Background`, `Card`, dan `Text` dengan opsi *Color Picker* kustom.
   - Live Preview visual tema secara real-time.
2. **Seksi Bahasa Storefront:**
   - Radio / Select pilihan: `🇮🇩 Bahasa Indonesia (id)` vs `🇲🇾 Bahasa Melayu (ms)`.
3. **Seksi Mata Uang (Currency):**
   - Radio / Select pilihan: `IDR (Rp - Indonesia)` vs `MYR (RM - Malaysia)`.
