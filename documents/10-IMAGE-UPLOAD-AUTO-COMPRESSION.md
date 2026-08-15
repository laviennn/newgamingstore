# 10 - Pemetaan Fitur Upload Gambar Admin & Arsitektur Hybrid Auto-Compression

Dokumen ini memetakan seluruh titik unggah gambar (*image upload points*) di seluruh antarmuka Admin Backoffice serta merancang sistem **Hybrid Auto-Compression** (Client-Side Pre-Compression + Server-Side Optimization) menuju Cloudflare R2 Storage.

---

## 1. Pemetaan Menyeluruh Titik Upload Gambar

Berikut adalah pemetaan lengkap seluruh fitur upload gambar pada Backoffice Admin:

| Halaman Admin | Komponen UI | Form Field / Key | Jenis Gambar | Dimensi Rekomendasi | Preset Kompresi | Target Ukuran |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **1. `/admin/games`** | `GameFormModal.tsx` | `image_url` | Game Icon | 512 × 512 (1:1) | `icon` (WebP, Q: 85%) | **~25 KB** |
| **1. `/admin/games`** | `GameFormModal.tsx` | `background_image` | Popular Section Banner | 1920 × 1080 (16:9) | `banner` (WebP, Q: 82%) | **~120 KB** |
| **1. `/admin/games`** | `GameFormModal.tsx` | `guide_image_url` | Panduan Topup / Form Guide | 1080 × 1080 (1:1 / Flexible) | `guide` (WebP, Q: 85%) | **~75 KB** |
| **2. `/admin/products`** | `ProductFormModal.tsx` | `image_url` | Product / Denom Icon | 512 × 512 (1:1) | `icon` (WebP, Q: 85%) | **~20 KB** |
| **3. `/admin/contacts`** | `ContactsClient.tsx` | `waFloatingAvatarUrl` | Avatar CS WhatsApp | 512 × 512 (1:1 Alpha) | `avatar` (WebP, Q: 88%) | **~35 KB** |
| **3. `/admin/contacts`** | `ContactsClient.tsx` | `footerBannerUrl` | Banner Footer Toko | 1920 × 600 (Wide) | `banner` (WebP, Q: 82%) | **~95 KB** |
| **4. `/admin/content`** | `ContentClient.tsx` | `logoUrl` | Logo Toko / Brand | 600 × 200 (Aspect Alpha) | `logo` (WebP, Q: 90%) | **~30 KB** |
| **4. `/admin/content`** | `ContentClient.tsx` | `gameDetailBanner` | Banner Halaman Detail Game | 1920 × 600 (Wide) | `banner` (WebP, Q: 82%) | **~110 KB** |
| **4. `/admin/content`** | `ContentClient.tsx` | `ogImage` | OpenGraph Banner (SEO & WA Share) | 1200 × 630 (OG Ratio) | `banner` (WebP, Q: 85%) | **~90 KB** |
| **4. `/admin/content`** | `ContentClient.tsx` | `sliders[].imageUrl` | Hero Slider Carousel | 1920 × 750 (Banner) | `slider` (WebP, Q: 82%) | **~130 KB** |
| **5. `/admin/payments`** | `PaymentFormModal.tsx` | `logo_url` | Logo Bank / E-Wallet | 400 × 200 (Alpha) | `icon` (WebP, Q: 88%) | **~20 KB** |
| **5. `/admin/payments`** | `PaymentFormModal.tsx` | `qr_image_url` | Barcode QRIS Statis / Dinamis | 800 × 800 (Square Crisp) | `qris` (WebP, Q: 90%) | **~50 KB** |
| **6. `/admin/articles`** | `ArticleFormModal.tsx` | `image_url` | Thumbnail / Header Artikel | 1200 × 675 (16:9) | `banner` (WebP, Q: 82%) | **~85 KB** |

---

## 2. Mengapa Memilih Arsitektur Hybrid Auto-Compression?

```
[ Operator Upload File (Misal: JPG/PNG 5MB - 12MB) ]
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│  LAYER 1: Client-Side Pre-Compression (Browser Canvas) │
│  • Konversi otomatis ke format WebP                    │
│  • Resizing cerdas sesuai Preset (Icon/Banner/Slider)  │
│  • Reduksi ukuran instan (5MB ➔ ~80KB) dalam <150ms    │
│  • Bandwidth hemat, upload secepat kilat (0 delay)     │
└────────────────────────────────────────────────────────┘
                       │
                       ▼ (Mengirim WebP Ringan ~80KB via FormData)
┌────────────────────────────────────────────────────────┐
│  LAYER 2: Server-Side Validation & Final Optimizer     │
│  • Magic Bytes Security Check (RIFF...WEBP)            │
│  • Stripping Metadata EXIF (GPS, Camera, Privasi)      │
│  • UUID-based Safe Filename (Anti-Directory Traversal) │
│  • Upload ke Cloudflare R2 Storage (S3 API)           │
└────────────────────────────────────────────────────────┘
                       │
                       ▼
[ Cloudflare R2 Bucket / Public CDN URL ] (Ukuran Ringan, Visual Tajam)
```

### Keunggulan Utama:
1. **Kecepatan Upload Ekstrem:** Mengurangi beban transfer data hingga **90% - 97%** sebelum data dikirim melalui koneksi internet operator.
2. **Kualitas Gambar Tetap Tajam (Crisp):** Algoritma *high-quality bicubic downscaling* mencegah gambar menjadi buram/pecah meskipun ukurannya turun drastis.
3. **Mendukung Transparansi Alpha:** Tetap mempertahankan transparansi PNG/WebP untuk logo toko, icon game, dan avatar CS.
4. **Keamanan Maksimal:** Sanitasi Magic Bytes dan penghapusan EXIF metadata menjamin tidak ada kode berbahaya yang masuk ke bucket penyimpanan.

---

## 3. Spesifikasi Teknis Preset Kompresi

Daftar preset kompresi yang akan disediakan pada utilitas client:

```typescript
export interface CompressionPreset {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0.1 s/d 1.0 (WebP Quality)
  mimeType: "image/webp" | "image/png" | "image/jpeg";
  preserveAlpha?: boolean;
}

export const COMPRESSION_PRESETS: Record<string, CompressionPreset> = {
  // Preset 1: Icon Game, Produk, & Bank (Square / Small)
  icon: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.85,
    mimeType: "image/webp",
    preserveAlpha: true,
  },
  // Preset 2: Banner Hero, Background Popular, & Footer
  banner: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.82,
    mimeType: "image/webp",
  },
  // Preset 3: Slider Carousel Utama
  slider: {
    maxWidth: 1920,
    maxHeight: 800,
    quality: 0.82,
    mimeType: "image/webp",
  },
  // Preset 4: Logo Brand / Storefront Header
  logo: {
    maxWidth: 600,
    maxHeight: 240,
    quality: 0.90,
    mimeType: "image/webp",
    preserveAlpha: true,
  },
  // Preset 5: Barcode QRIS (Kerapatan tinggi agar mudah di-scan kamera)
  qris: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.92,
    mimeType: "image/webp",
  },
  // Preset 6: Panduan Topup & Form Guide
  guide: {
    maxWidth: 1080,
    maxHeight: 1080,
    quality: 0.85,
    mimeType: "image/webp",
  },
  // Preset 7: Avatar CS WhatsApp
  avatar: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.88,
    mimeType: "image/webp",
    preserveAlpha: true,
  },
};
```

---

## 4. Rencana Implementasi & Eksekusi

### A. Utilitas Client: `src/lib/client-image-compressor.ts`
Fungsi `compressImageClient(file: File, presetName: keyof typeof COMPRESSION_PRESETS): Promise<File>`
- Membaca file menggunakan `HTMLImageElement` / `ImageBitmap`.
- Menghitung rasio aspek secara proporsional sesuai `maxWidth` dan `maxHeight`.
- Merender ke `HTMLCanvasElement` dengan properti `imageSmoothingEnabled = true` dan `imageSmoothingQuality = 'high'`.
- Menghasilkan `Blob` WebP melalui `canvas.toBlob(...)`.
- Mengembalikan instance `File` baru dengan ekstensi `.webp` yang siap dikirim via `FormData`.

### B. Komponen Reusable: `src/components/admin/ImageUploadDropzone.tsx`
Komponen unggah gambar standar untuk semua modal & form admin yang dilengkapi:
- Indikator ukuran file sebelum vs sesudah kompresi (misal: *`3.8 MB ➔ 84 KB (-97%)`*).
- Indikator status kompresi & uploading dengan visual progress ring.
- Preview gambar interaktif dengan tombol ganti dan hapus.

### C. Server Action: `src/app/actions/upload.ts` & `src/lib/upload.ts`
- Menerima file hasil kompresi (format `.webp`).
- Melakukan verifikasi Magic Bytes `RIFF....WEBP`.
- Menyimpan ke bucket Cloudflare R2 dengan nama UUID acak aman.
- Mengembalikan URL CDN publik.

### D. Refactoring & Integrasi Form Admin:
1. **`/admin/games`** (`GameFormModal.tsx`): Integrasi preset `icon`, `banner`, dan `guide`.
2. **`/admin/products`** (`ProductFormModal.tsx`): Integrasi preset `icon`.
3. **`/admin/contacts`** (`ContactsClient.tsx`): Integrasi preset `avatar` dan `banner`.
4. **`/admin/content`** (`ContentClient.tsx`): Integrasi preset `logo`, `banner`, `slider`, dan `banner` (OG Image).
5. **`/admin/payments`** (`PaymentFormModal.tsx`): Integrasi preset `icon` (Logo) dan `qris` (QRIS).
6. **`/admin/articles`** (`ArticleFormModal.tsx`): Integrasi preset `banner`.
