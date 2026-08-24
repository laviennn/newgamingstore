# 🚀 Panduan Migrasi Production dari Vercel ke VPS Lightnode (Zero-Downtime)

Dokumen ini berisi panduan lengkap langkah demi langkah untuk memindahkan aplikasi **New Gaming Store (Multi-Tenant Multi-Currency)** dari **Vercel** ke **VPS Lightnode (Ubuntu 22.04, 1 vCPU, 2 GB RAM, Jakarta)** dengan jaminan **0 Detik Downtime (Zero-Downtime Migration)**.

---

## 📑 Daftar Isi
1. [Strategi Zero-Downtime: Apakah Web Akan Down?](#1-strategi-zero-downtime-apakah-web-akan-down)
2. [Spesifikasi & Informasi Server](#2-spesifikasi--informasi-server)
3. [Langkah 1: Persiapan Server VPS Baru](#langkah-1-persiapan-server-vps-baru)
4. [Langkah 2: Optimasi Next.js Standalone Mode](#langkah-2-optimasi-nextjs-standalone-mode)
5. [Langkah 3: Deploy Aplikasi ke VPS](#langkah-3-deploy-aplikasi-ke-vps)
6. [Langkah 4: Konfigurasi Nginx Reverse Proxy](#langkah-4-konfigurasi-nginx-reverse-proxy)
7. [Langkah 5: Testing & Validasi Sebelum Cutover](#langkah-5-testing--validasi-sebelum-cutover)
8. [Langkah 6: Pengalihan DNS (Cutover) & SSL](#langkah-6-pengalihan-dns-cutover--ssl)
9. [Langkah 7: Skrip Update Otomatis (One-Click Deploy)](#langkah-7-skrip-update-otomatis-one-click-deploy)
10. [Langkah 8: Monitoring & Maintenance](#langkah-8-monitoring--maintenance)

---

## 1. Strategi Zero-Downtime: Apakah Web Akan Down?

> **Jawaban: TIDAK AKAN DOWN (100% Tetap Online).**

### Mengapa Bisa Tanpa Downtime?
Kita menggunakan metode **Parallel Staging & DNS Hot-Swap**:
1. Web di **Vercel tetap dibiarkan menyala normal** dan melayani transaksi pengunjung seperti biasa.
2. Kita setup VPS Lightnode dari nol, menginstall Node.js, clone project, build, dan menjalankan aplikasi di port `3000` via Nginx.
3. Kita menguji VPS secara internal terlebih dahulu (menggunakan IP atau hosts mapping) untuk memastikan 100% berjalan sempurna.
4. Database PostgreSQL berada di **Supabase Cloud** yang terpusat. Baik instance Vercel maupun instance VPS terhubung ke database yang sama persis, sehingga transaksi tidak akan hilang.
5. Setelah VPS siap, kita cukup mengubah **DNS A Record** di Cloudflare / Domain Registrar ke IP VPS (`130.94.94.187`).
6. Selama masa propagasi DNS (0 - 60 detik di Cloudflare), user lama tetap dilayani Vercel dan user baru langsung masuk ke VPS.
7. Setelah trafik 100% berpindah ke VPS, barulah project di Vercel dihapus.

---

## 2. Spesifikasi & Informasi Server

* **Provider**: Lightnode
* **Lokasi**: Jakarta, Indonesia 🇮🇩
* **IP Publik (IPv4)**: `130.94.94.187`
* **OS**: Ubuntu 22.04 LTS
* **CPU / RAM**: 1 vCPU (Shared) / 2 GB RAM / 50 GB SSD
* **User Default**: `root`

---

## Langkah 1: Persiapan Server VPS Baru

Akses VPS Anda melalui terminal SSH:
```bash
ssh root@130.94.94.187
```

### 1.1 Update Paket Sistem & Install Utilities
```bash
apt update && apt upgrade -y
apt install -y curl git ufw build-essential htop nginx certbot python3-certbot-nginx
```

### 1.2 Setup SWAP Memory 4 GB (Sangat Penting untuk 2 GB RAM)
Swap memory memastikan server tidak akan pernah kehabisan RAM (*Out of Memory / OOM*) saat proses `npm run build` atau saat ada lonjakan trafik.
```bash
# Buat file swap 4GB
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Jadikan permanen saat server restart
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Optimasi swappiness
sysctl vm.swappiness=10
echo 'vm.swappiness=10' >> /etc/sysctl.conf
```

### 1.3 Install Node.js 20 LTS & PM2
```bash
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verifikasi versi Node & NPM
node -v   # Output: v20.x.x
npm -v    # Output: 10.x.x

# Install PM2 (Process Manager) secara global
npm install -g pm2
```

### 1.4 Konfigurasi Firewall (UFW)
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status
```

---

## Langkah 2: Optimasi Next.js Standalone Mode

Pastikan file `next.config.ts` di codebase lokal Anda sudah mengaktifkan `output: 'standalone'`.

Periksa `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // <-- Wajib aktif untuk deploy VPS hemat RAM
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Konfigurasi lainnya...
};

export default nextConfig;
```

---

## Langkah 3: Deploy Aplikasi ke VPS

### 3.1 Buat Direktori dan Clone Repository
```bash
mkdir -p /var/www
cd /var/www

# Clone repository project Anda
git clone https://github.com/laviennn/newgamingstore.git gamingstore
cd /var/www/gamingstore
```

### 3.2 Buat File Environment (`.env.production`)
Salin semua isi environment variable dari Vercel / `.env.local` lokal Anda ke server:
```bash
nano .env.production
```
*Isi dengan environment variable lengkap (Supabase URL, Anon Key, Service Role Key, Cloudflare R2, Midtrans/Tripay, dll.). Simpan dengan `Ctrl + O` -> `Enter` -> `Ctrl + X`.*

### 3.3 Install Dependencies & Build Standalone
```bash
cd /var/www/gamingstore

# Install package bersih
npm ci

# Build aplikasi
npm run build

# Salin asset statis ke dalam folder standalone (Wajib untuk Next.js Standalone)
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

### 3.4 Jalankan Aplikasi dengan PM2
```bash
cd /var/www/gamingstore/.next/standalone

# Jalankan server via PM2
pm2 start server.js --name "gamingstore" --node-args="--max-old-space-size=1536"

# Buat PM2 otomatis menyala saat server restart
pm2 save
pm2 startup
```

*Cek status server:*
```bash
pm2 status
curl http://localhost:3000
```

---

## Langkah 4: Konfigurasi Nginx Reverse Proxy

Nginx akan menerima trafik dari port 80/443 dan meneruskannya ke Next.js (port 3000) dengan optimalisasi Gzip dan Multi-Tenant Header.

### 4.1 Buat File Konfigurasi Nginx
```bash
nano /etc/nginx/sites-available/gamingstore
```

Isi dengan konfigurasi berikut (Ganti `domainutama.com` dan `*.domainutama.com` sesuai domain Anda):
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name domainutama.com *.domainutama.com yowanastore.com *.yowanastore.com topupdisiniyuk.com *.topupdisiniyuk.com localhost 130.94.94.187;

    client_max_body_size 20M;

    # Optimasi Gzip Compression
    gzip on;
    gzip_proxied any;
    gzip_comp_level 4;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Cache static assets Next.js
    location /_next/static/ {
        alias /var/www/gamingstore/.next/standalone/.next/static/;
        expires 365d;
        access_log off;
    }

    location /public/ {
        alias /var/www/gamingstore/.next/standalone/public/;
        expires 30d;
        access_log off;
    }

    # Proxy ke aplikasi Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout handling
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 4.2 Aktifkan Konfigurasi & Reload Nginx
```bash
# Aktifkan site
ln -s /etc/nginx/sites-available/gamingstore /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Uji konfigurasi Nginx
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Langkah 5: Testing & Validasi Sebelum Cutover

Sebelum mengarahkan domain utama, pastikan VPS merespons dengan benar:

1. **Uji dari browser**: Buka `http://130.94.94.187` di browser.
2. **Uji simulasi domain tenant via cURL dari laptop Anda**:
   ```bash
   curl -I -H "Host: yowanastore.com" http://130.94.94.187
   ```
   *Jika merespons `HTTP/1.1 200 OK`, artinya multi-tenant routing di VPS sudah 100% siap!*

---

## Langkah 6: Pengalihan DNS (Cutover) & SSL

### Opsi A: Jika Domain Menggunakan Cloudflare (Sangat Direkomendasikan ⭐)
1. Buka Dashboard **Cloudflare** -> Menu **DNS Records**.
2. Ubah `A Record` untuk `@` dan `*` (atau subdomain tenant):
   - **Type**: `A`
   - **Name**: `@` dan `*`
   - **IPv4 Address**: `130.94.94.187`
   - **Proxy Status**: `Proxied (Orange Cloud / On)`
   - **TTL**: `Auto`
3. Pada menu **SSL/TLS** di Cloudflare:
   - Pilih mode **Full** atau **Full (Strict)**.
4. **Selesai!** Dalam 10–30 detik seluruh trafik dunia akan berpindah secara mulus ke VPS Anda tanpa ada gangguan koneksi bagi user yang sedang bertransaksi.

### Opsi B: Jika Menggunakan Certbot SSL Langsung di VPS
```bash
certbot --nginx -d domainutama.com -d www.domainutama.com
```

---

## Langkah 7: Skrip Update Otomatis (One-Click Deploy)

Untuk mempermudah update code di masa depan setiap kali ada fitur baru:

### 7.1 Buat Script Deploy di Server
```bash
nano /var/www/gamingstore/deploy.sh
```

Isi dengan skrip berikut:
```bash
#!/bin/bash
set -e

echo "🚀 Memulai Deployment Update..."
cd /var/www/gamingstore

# 1. Ambil code terbaru dari branch development / main
git pull origin development

# 2. Install dependency jika ada package baru
npm ci

# 3. Build standalone
npm run build

# 4. Salin static assets
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 5. Reload PM2 dengan zero-downtime
pm2 reload gamingstore

echo "✅ Deployment Sukses & Berjalan Normal!"
```

### 7.2 Berikan Hak Eksekusi
```bash
chmod +x /var/www/gamingstore/deploy.sh
```

*Setiap kali ingin update versi website, cukup jalankan satu perintah:*
```bash
/var/www/gamingstore/deploy.sh
```

---

## Langkah 8: Monitoring & Maintenance

### Perintah Cepat yang Berguna:
* **Melihat Penggunaan RAM & CPU Realtime**:
  ```bash
  htop
  ```
* **Melihat Status & Uptime Aplikasi**:
  ```bash
  pm2 status
  ```
* **Melihat Log Error / Transaksi Realtime**:
  ```bash
  pm2 logs gamingstore
  ```
* **Restart Aplikasi**:
  ```bash
  pm2 restart gamingstore
  ```
* **Melihat Log Nginx**:
  ```bash
  tail -f /var/log/nginx/error.log
  ```

---

## 🎯 Kesimpulan
Dengan mengikuti panduan di atas:
1. Website Anda **TIDAK AKAN MENGALAMI DOWNTIME** sama sekali.
2. Bebas dari batasan 4 jam CPU Vercel selamanya.
3. Loading website menjadi jauh lebih instan bagi pengunjung Indonesia karena server berada di Jakarta.
4. Mampu menampung 5–20 tenant aktif dengan konsumsi RAM yang sangat efisien (~600 MB / 2000 MB).
