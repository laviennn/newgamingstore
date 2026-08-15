# Dokumentasi & Panduan: Multi-Tenant Cloudflare R2 Asset Storage

Dokumen ini menjelaskan arsitektur **Multi-Tenant Object Storage** menggunakan **Cloudflare R2** dengan pendekatan **Opsi 1 (Single Master Bucket + Multi Custom Domains)**.

---

## 1. Latar Belakang & Masalah Sebelumnya

Sebelumnya, konfigurasi storage dideklarasikan secara statis di file `.env.local`:
```env
R2_BUCKET_NAME=assetsnewgaming
R2_PUBLIC_URL=https://assets.newgamingstore.com
```

### Masalah yang Terjadi:
- Ketika ada tenant baru (contoh: `topupdisiniyuk.com`), semua gambar yang diunggah tetap menghasilkan URL `https://assets.newgamingstore.com/...`.
- Terjadi **kebocoran branding (*branding leak*)**, di mana pelanggan tenant baru melihat domain milik tenant utama.
- Tidak fleksibel untuk ekosistem SaaS *white-label*.

---

## 2. Arsitektur Solusi Terpilih: Opsi 1 (Zero Migration & Zero Downtime)

### Mengapa Opsi 1 Sangat Efisien & Aman?
1. **100% Backward Compatible**:  
   Semua gambar lama yang sudah terlanjur tersimpan di database (`https://assets.newgamingstore.com/...`) tetap berada di bucket `assetsnewgaming` dan tetap aktif selamanya tanpa perlu dipindahkan atau diubah datanya.
2. **Dynamic Domain Resolution**:  
   Ketika tenant `topupdisiniyuk.com` mengunggah gambar baru, sistem secara dinamis mendeteksi context tenant dan membuat URL publik:
   ```
   https://assets.topupdisiniyuk.com/uploads/<uuid>.webp
   ```
3. **Cloudflare Zero Egress**:  
   Cloudflare R2 tidak mengenakan biaya transfer data keluar (*Zero Egress Fee*), sehingga multi-tenant custom domain sangat hemat biaya.

---

## 3. Alur Kerja Resolusi Domain Aset (`src/lib/storageUtils.ts`)

```mermaid
flowchart TD
    A[Upload File Triggered] --> B[Resolve Active Tenant Context]
    B --> C{Custom Asset Domain di Setting Tenant?}
    C -- Ada --> D[Gunakan Custom Domain: e.g. cdn.tenant.com]
    C -- Tidak Ada --> E{Apakah Domain Valid & Bukan Localhost?}
    E -- Ya --> F[Generate Otomatis: https://assets.tenant_domain]
    E -- Tidak (Localhost/Dev) --> G[Fallback: process.env.R2_PUBLIC_URL]
    
    D --> H[Kirim ke uploadImageToR2 dengan base URL terpilih]
    F --> H
    G --> H
    H --> I[Output URL: {baseUrl}/uploads/{uuid}.webp]
```

### Hirarki Resolusi:
1. **Prioritas 1 (Custom Override)**: Nilai dari `tenant.theme_config.storage_public_url` atau `tenant.theme_config.custom_asset_domain` jika SuperAdmin mengatur CDN khusus.
2. **Prioritas 2 (Auto Subdomain Tenant)**: `https://assets.${tenant.domain}` (contoh: `https://assets.topupdisiniyuk.com`).
3. **Prioritas 3 (Development Fallback)**: `process.env.R2_PUBLIC_URL` atau `https://assets.newgamingstore.com` (aktif otomatis pada environment `localhost`).

---

## 4. Panduan Operator: Menghubungkan Domain Baru di Cloudflare R2 (1 Menit)

Setiap kali Anda mendaftarkan atau menambahkan domain tenant baru (misal: `topupdisiniyuk.com`), ikuti 3 langkah mudah ini di Cloudflare Dashboard:

1. **Buka Cloudflare Dashboard**:
   - Masuk ke akun Cloudflare Anda.
   - Buka menu **R2 Storage** ➔ Pilih bucket **`assetsnewgaming`**.
2. **Hubungkan Custom Domain**:
   - Masuk ke tab **Settings** ➔ Bagian **Custom Domains**.
   - Klik tombol **Connect Domain**.
   - Ketik subdomain aset tenant: `assets.topupdisiniyuk.com`.
   - Klik **Continue** dan **Connect Domain**.
3. **Selesai**:
   - Cloudflare akan otomatis mengelola sertifikat SSL (HTTPS) dan DNS record untuk subdomain tersebut.
   - Semua gambar yang diunggah dari dashboard admin tenant tersebut akan langsung aktif dan dapat diakses dengan domain `assets.topupdisiniyuk.com`.

---

## 5. File & Modul yang Diperbarui

- [`src/lib/storageUtils.ts`](file:///Users/naoo/P.A.R.A/PROJECTS/newgamingstore/src/lib/storageUtils.ts): Engine pembersih & pembuat domain aset multi-tenant.
- [`src/lib/upload.ts`](file:///Users/naoo/P.A.R.A/PROJECTS/newgamingstore/src/lib/upload.ts): Dukungan parameter `publicBaseUrl` dinamis pada `uploadImageToR2`.
- [`src/app/actions/upload.ts`](file:///Users/naoo/P.A.R.A/PROJECTS/newgamingstore/src/app/actions/upload.ts): Server action terpusat yang otomatis mendeteksi tenant aktif (Admin & Storefront).
