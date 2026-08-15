# 06 - FASE 1: THEME EXECUTION & PERFORMANCE SPECIFICATION

Dokumen ini berisi arsitektur teknis, analisis performa, penanganan celah (FOUC/CLS), serta rencana eksekusi mendalam untuk **FASE 1: Multi-Tenant Theme Presets & Dynamic Styling** pada platform Top Up Game.

---

## 1. Analisis Software Engineer: Celah & Solusi Best Practices

### ❌ Celah & Masalah Pada Sistem Tema Konvensional:
1. **FOUC (Flash of Unstyled Content) & CLS (Cumulative Layout Shift):**
   Jika warna tema disuntikkan secara Client-Side (`useEffect` atau React state di browser), pengunjung akan melihat tampilan default (biru) selama ~100-200ms sebelum berubah ke warna tema (misal Emerald). Ini merusak UX dan merendahkan skor Core Web Vitals Google.
2. **Web Lemot / Re-Paint Overhead:**
   Menggunakan inline styles pada ratusan elemen React VDOM akan memaksa browser melakukan re-flow & re-paint berlebih yang membebankan CPU client.
3. **Hardcoded Tailwind Colors:**
   Komponen storefront yang masih menggunakan class statis `bg-blue-600`, `text-blue-400`, `bg-[#111111]`, `bg-[#0a0a0a]` akan "bocor" (tetap biru/gelap statis) saat tema berganti ke Emerald.

### ✅ Solusi Best Practices yang Diterapkan:
1. **Zero-FOUC Server-Side Dynamic CSS Variables:**
   Tema disuntikkan secara **Server-Side Rendering (SSR)** di `src/app/[domain]/layout.tsx` langsung ke tag `<head>` HTML melalui `<style>` tag `:root` variables. Tampilan berwarna pas sejak milidetik pertama HTML diterima browser.
2. **Native CSS Variables (Hardware Accelerated):**
   Menggunakan `--primary`, `--background`, `--card`, `--text`, dan `--accent-glow`. Pergantian tema ditangani secara native oleh GPU/CSS engine browser (0ms JS runtime overhead).
3. **Semantic Class Refactoring:**
   Mengganti class Tailwind hardcoded pada storefront menjadi variable-aware Tailwind utilities (contoh: `bg-primary` atau `bg-[var(--primary)]`, `bg-card` atau `bg-[var(--card)]`).

---

## 2. Struktur Data Tema (`theme_config`)

Tersimpan pada tabel `tenants.theme_config` (JSONB):

```json
{
  "themePreset": "emerald", // "default" | "emerald"
  "colors": {
    "primary": "#10b981",
    "background": "#06120e",
    "card": "#0e221b",
    "text": "#ffffff"
  }
}
```

---

## 3. Spesifikasi Preset Tema

### 1. Default Theme (Classic Neon Blue)
- **Preset Key:** `default`
- **Primary Color:** `#2563eb` (Neon Royal Blue)
- **Background Color:** `#0a0f1d` (Deep Dark Blue)
- **Card Color:** `#1c2333` (Slate Dark)
- **Text Color:** `#ffffff`
- **Accent Glow:** `rgba(37, 99, 235, 0.15)`

### 2. Emerald Theme (Cyber Emerald & Luxury Green)
- **Preset Key:** `emerald`
- **Primary Color:** `#10b981` (Emerald Cyber Green)
- **Background Color:** `#06120e` (Dark Emerald Velvet)
- **Card Color:** `#0e221b` (Emerald Glass)
- **Text Color:** `#ffffff`
- **Accent Glow:** `rgba(16, 185, 129, 0.15)`

---

## 4. Rencana Implementasi Halaman Admin (`/admin/theme`)

1. **Card Visual Selector Preset Tema:**
   - Menyediakan pilihan visual card: `[ Default Theme (Neon Blue) ]` vs `[ Emerald Theme (Cyber Green) ]`.
   - Ketika BO Operator mengklik preset `Emerald`, nilai Color Picker otomatis terisi dengan kode warna HEX Emerald.
2. **Custom Color Overrides:**
   - BO Operator tetap memiliki kontrol penuh untuk mengubah masing-masing warna HEX via Color Picker jika ingin warna unik.
3. **Real-time Live Preview:**
   - Pratinjau komponen mini (Header, Card Produk, Tombol Beli, Badge) di Admin BO secara langsung merespons perubahan warna sebelum tombol **Simpan Tema** diklik.

---

## 5. Rencana Eksekusi Teknis FASE 1

### File 1: `src/lib/themeUtils.ts` (NEW)
Definisi konstanta preset `THEME_PRESETS`, helper pemeta CSS variables, serta utilitas pengkonversi warna.

### File 2: `src/app/admin/(authenticated)/theme/ThemeClient.tsx` (MODIFY)
Pembaruan UI Admin BO dengan Preset Selector, kustomisasi HEX color, dan Live Preview.

### File 3: `src/app/[domain]/layout.tsx` (MODIFY)
Penyuntikan Server-Side Dynamic CSS Variables ke tag `<head>` HTML berdasarkan `tenant.theme_config`.

### File 4: `src/components/storefront/StorefrontGameForm.tsx` & Layouts (MODIFY)
Refactoring class Tailwind hardcoded (`bg-blue-600`, `bg-[#111111]`, dll.) menjadi semantic CSS Variables agar merespons tema `default` maupun `emerald` secara sempurna.
