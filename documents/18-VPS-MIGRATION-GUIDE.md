# 🚀 Panduan Migrasi Production & Setup Dual-Environment (Staging + Prod) di VPS Lightnode

Dokumen ini berisi arsitektur dan panduan lengkap menjalankan **dua environment terisolasi (Staging & Production)** dalam **1 VPS Lightnode (Ubuntu 22.04, 1 vCPU, 2 GB RAM, Jakarta)** secara **sangat hemat RAM**, database terpisah, dan jaminan **Zero-Downtime**.

---

## 📑 Daftar Isi
1. [Arsitektur Dual-Environment di 1 VPS](#1-arsitektur-dual-environment-di-1-vps)
2. [Analisis Konsumsi RAM (2 GB VPS)](#2-analisis-konsumsi-ram-2-gb-vps)
3. [Informasi Database & Domain (Staging vs Prod)](#3-informasi-database--domain-staging-vs-prod)
4. [Langkah 1: Persiapan Server & Swap](#langkah-1-persiapan-server--swap)
5. [Langkah 2: Setup & Deploy Environment STAGING (Port 3001)](#langkah-2-setup--deploy-environment-staging-port-3001)
6. [Langkah 3: Setup & Deploy Environment PRODUCTION (Port 3000)](#langkah-3-setup--deploy-environment-production-port-3000)
7. [Langkah 4: Konfigurasi Nginx Dual-Host (Reverse Proxy)](#langkah-4-konfigurasi-nginx-dual-host-reverse-proxy)
8. [Langkah 5: Testing Domain Staging (`panel-arvello.space`)](#langkah-5-testing-domain-staging-panel-arvellospace)
9. [Langkah 6: Cutover Domain Production (Zero-Downtime)](#langkah-6-cutover-domain-production-zero-downtime)
10. [Langkah 7: Skrip One-Click Deploy Terpisah](#langkah-7-skrip-one-click-deploy-terpisah)
11. [Langkah 8: Monitoring & Maintenance](#langkah-8-monitoring--maintenance)

---

## 1. Arsitektur Dual-Environment di 1 VPS

```mermaid
flowchart TD
    subgraph Pengunjung
        U1[Browser User: Staging] -->|games.panel-arvello.space| NG[Nginx Reverse Proxy Port 80/443]
        U2[Browser User: Production] -->|yowanastore.com / topupdisiniyuk.com| NG
    end

    subgraph VPS Lightnode Jakarta (2GB RAM)
        NG -->|Proxy Port 3001| PM_STG[PM2: gamingstore-staging]
        NG -->|Proxy Port 3000| PM_PRD[PM2: gamingstore-prod]
        
        PM_STG --> APP_STG[Next.js Standalone /var/www/gamingstore-staging]
        PM_PRD --> APP_PRD[Next.js Standalone /var/www/gamingstore-prod]
    end

    subgraph Supabase Cloud Database
        APP_STG -->|Koneksi Terisolasi| DB_STG[(Supabase Staging: buqilwpqantgiwedehtj)]
        APP_PRD -->|Koneksi Terisolasi| DB_PRD[(Supabase Production: gxjcsreigvdnyhusxyyp)]
    end
```

---

## 2. Analisis Konsumsi RAM (2 GB VPS)

Dengan menggunakan mode **Next.js Standalone**, kedua environment dapat berjalan bersamaan dengan sangat efisien:

| Service | Estimasi Penggunaan RAM |
| :--- | :--- |
| **Next.js Staging (Port 3001)** | ~180 MB |
| **Next.js Production (Port 3000)** | ~250 MB |
| **Nginx Web Server** | ~35 MB |
| **PM2 Process Manager** | ~35 MB |
| **OS & Ubuntu Services** | ~250 MB |
| **TOTAL TERPAKAI** | **~750 MB / 2000 MB (Hanya 37.5%)** |
| **SISA RAM BEBAS** | **> 1.25 GB RAM BEBAS** + 2–4 GB Swap |

> **Kesimpulan:** VPS 2 GB Anda masih memiliki sisa memori > 1.2 GB yang sangat longgar untuk menangani lonjakan transaksi harian.

---

## 3. Informasi Database & Domain (Staging vs Prod)

### 🧪 Environment STAGING
* **Domain Storefront**: `games.panel-arvello.space` (dan `*.panel-arvello.space`)
* **Domain Admin**: `admin.panel-arvello.space`
* **Port Internal**: `3001`
* **Folder VPS**: `/var/www/gamingstore-staging`
* **Database Supabase**: `buqilwpqantgiwedehtj` (dari file `.env.local`)

### 🏆 Environment PRODUCTION
* **Domain Storefront**: `yowanastore.com`, `*.yowanastore.com`, `topupdisiniyuk.com`, `*.topupdisiniyuk.com`, dll.
* **Domain Admin**: `admin.newgamingstore.com` (atau subdomain admin prod Anda)
* **Port Internal**: `3000`
* **Folder VPS**: `/var/www/gamingstore-prod`
* **Database Supabase**: `gxjcsreigvdnyhusxyyp` (Production Utama)

---

## Langkah 1: Persiapan Server & Swap

Pastikan paket dasar, Node 20 LTS, PM2, dan Nginx sudah terinstall di VPS:

```bash
# Update paket sistem & install tools
apt update && apt upgrade -y
apt install -y curl git ufw build-essential htop nginx certbot python3-certbot-nginx

# Install Node.js 20 LTS (bersihkan libnode-dev jika ada konflik)
apt remove -y libnode-dev libnode72 nodejs npm
apt autoremove -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# Setup UFW Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## Langkah 2: Setup & Deploy Environment STAGING (Port 3001)

### 2.1 Clone ke Direktori Staging
```bash
mkdir -p /var/www
cd /var/www
git clone -b development https://github.com/laviennn/newgamingstore.git gamingstore-staging
cd /var/www/gamingstore-staging
```

### 2.2 Buat File `.env.production` untuk STAGING
```bash
nano /var/www/gamingstore-staging/.env.production
```

**Tempel konfigurasi STAGING berikut (Database `buqilwpqantgiwedehtj`):**
```env
# ==========================================
# STAGING ENVIRONMENT (buqilwpqantgiwedehtj)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://buqilwpqantgiwedehtj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cWlsd3BxYW50Z2l3ZWRlaHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODMyNTksImV4cCI6MjEwMjM1OTI1OX0.ccu0NnLVVN2HCGZsePLNdtsayNVlxjaRyEYSFg2gbF0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cWlsd3BxYW50Z2l3ZWRlaHRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njc4MzI1OSwiZXhwIjoyMTAyMzU5MjU5fQ.sZ8oQnJf9mBbdiWrqI-KIB04PUlu2wrHSS7JzWdMbz4
DATABASE_URL=postgresql://postgres.buqilwpqantgiwedehtj:jumfes-6tomna-xeZnyx@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

# Staging Multi-Tenant Domain
NEXT_PUBLIC_ROOT_DOMAIN=panel-arvello.space
NEXT_PUBLIC_ADMIN_DOMAIN=admin.panel-arvello.space

# Cloudflare R2 Assets
R2_ACCOUNT_ID=ca26e72804b3601f7b3f7efe1c0cb385
R2_ACCESS_KEY_ID=520659218560dd670a217522efc90d86
R2_SECRET_ACCESS_KEY=d15a15114a5604e96a98825b882f3bc68ba0790ae8c11ee51e2970ea655e289b
R2_BUCKET_NAME=assetsnewgaming
R2_PUBLIC_URL=https://assets.newgamingstore.com

# APIs
VIP_RESELLER_API_ID=0MtaIj83
VIP_RESELLER_API_KEY=htKQiiiOEGsorYVT6e9BN1pHA4G2rRQaNNGgYNHK5XMBjhzMhPEK6mbVf5dq5FrE
RAPIDAPI_KEY=6867513528mshc5487aee5d7b88ep10d074jsn72f185ca3c6b
KOKINPAY_API_KEY=kp5dac3e6eccfcae98edff49aa0a22ce9b641d26a89bd18003
MEMBER_SESSION_SECRET=Qc8lh7Emx7TtkgtnGjQfezWA58Ws/egpMM8Q+Uz2q9c=
```
*(Simpan: `Ctrl + O` $\rightarrow$ `Enter` $\rightarrow$ `Ctrl + X`)*.

### 2.3 Build & Jalankan STAGING di Port 3001
```bash
cd /var/www/gamingstore-staging
npm ci
npm run build

# Salin asset statis
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# Jalankan via PM2 di Port 3001
cd /var/www/gamingstore-staging/.next/standalone
PORT=3001 pm2 start server.js --name "gamingstore-staging" --node-args="--max-old-space-size=768"
pm2 save
```

---

## Langkah 3: Setup & Deploy Environment PRODUCTION (Port 3000)

### 3.1 Clone ke Direktori Production
```bash
cd /var/www
git clone -b development https://github.com/laviennn/newgamingstore.git gamingstore-prod
cd /var/www/gamingstore-prod
```

### 3.2 Buat File `.env.production` untuk PRODUCTION
```bash
nano /var/www/gamingstore-prod/.env.production
```

**Tempel konfigurasi PRODUCTION berikut (Database `gxjcsreigvdnyhusxyyp`):**
```env
# ==========================================
# PRODUCTION ENVIRONMENT (gxjcsreigvdnyhusxyyp)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://gxjcsreigvdnyhusxyyp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4amNzcmVpZ3ZkbnlodXN4eXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODYwOTEsImV4cCI6MjEwMTA2MjA5MX0.kzQtGZr9caf4BaRfqx4oTtDhzDapaXx-_PkmhiTaNHk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4amNzcmVpZ3ZkbnlodXN4eXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ4NjA5MSwiZXhwIjoyMTAxMDYyMDkxfQ.85sOVwbCAZfjoOxauf-JHPLS2g_EApFZ715ozZJaUGw

# Production Multi-Tenant Domain
NEXT_PUBLIC_ROOT_DOMAIN=newgamingstore.com
NEXT_PUBLIC_ADMIN_DOMAIN=admin.newgamingstore.com

# Cloudflare R2 Assets
R2_ACCOUNT_ID=ca26e72804b3601f7b3f7efe1c0cb385
R2_ACCESS_KEY_ID=520659218560dd670a217522efc90d86
R2_SECRET_ACCESS_KEY=d15a15114a5604e96a98825b882f3bc68ba0790ae8c11ee51e2970ea655e289b
R2_BUCKET_NAME=assetsnewgaming
R2_PUBLIC_URL=https://assets.newgamingstore.com

# APIs
VIP_RESELLER_API_ID=0MtaIj83
VIP_RESELLER_API_KEY=htKQiiiOEGsorYVT6e9BN1pHA4G2rRQaNNGgYNHK5XMBjhzMhPEK6mbVf5dq5FrE
RAPIDAPI_KEY=6867513528mshc5487aee5d7b88ep10d074jsn72f185ca3c6b
KOKINPAY_API_KEY=kp5dac3e6eccfcae98edff49aa0a22ce9b641d26a89bd18003
MEMBER_SESSION_SECRET=Qc8lh7Emx7TtkgtnGjQfezWA58Ws/egpMM8Q+Uz2q9c=
```
*(Simpan: `Ctrl + O` $\rightarrow$ `Enter` $\rightarrow$ `Ctrl + X`)*.

### 3.3 Build & Jalankan PRODUCTION di Port 3000
```bash
cd /var/www/gamingstore-prod
npm ci
npm run build

# Salin asset statis
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# Jalankan via PM2 di Port 3000
cd /var/www/gamingstore-prod/.next/standalone
PORT=3000 pm2 start server.js --name "gamingstore-prod" --node-args="--max-old-space-size=1024"
pm2 save
pm2 startup
```

---

## Langkah 4: Konfigurasi Nginx Dual-Host (Reverse Proxy)

Buat satu file konfigurasi Nginx cerdas yang memisahkan lalu lintas Staging (Port 3001) dan Production (Port 3000):

```bash
nano /etc/nginx/sites-available/gamingstore
```

**Tempel konfigurasi Nginx Dual-Environment berikut:**
```nginx
# =========================================================================
# 1. BLOCK STAGING (games.panel-arvello.space, admin, dll. -> Port 3001)
# =========================================================================
server {
    listen 80;
    listen [::]:80;
    server_name games.panel-arvello.space admin.panel-arvello.space *.panel-arvello.space;

    client_max_body_size 20M;
    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    location /_next/static/ {
        alias /var/www/gamingstore-staging/.next/standalone/.next/static/;
        expires 365d;
        access_log off;
    }

    location /public/ {
        alias /var/www/gamingstore-staging/.next/standalone/public/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3001; # Arahkan ke Port Staging
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}

# =========================================================================
# 2. BLOCK PRODUCTION (yowanastore.com, topupdisiniyuk.com, dll. -> Port 3000)
# =========================================================================
server {
    listen 80;
    listen [::]:80;
    server_name 
        yowanastore.com 
        *.yowanastore.com 
        topupdisiniyuk.com 
        *.topupdisiniyuk.com 
        newgamingstore.com
        *.newgamingstore.com
        localhost 
        130.94.94.187;

    client_max_body_size 20M;
    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    location /_next/static/ {
        alias /var/www/gamingstore-prod/.next/standalone/.next/static/;
        expires 365d;
        access_log off;
    }

    location /public/ {
        alias /var/www/gamingstore-prod/.next/standalone/public/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000; # Arahkan ke Port Production
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

### Aktifkan Konfigurasi Nginx:
```bash
ln -s /etc/nginx/sites-available/gamingstore /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Pastikan test berhasil
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Langkah 5: Testing Domain Staging (`panel-arvello.space`)

1. **Arahkan DNS di Cloudflare**:
   - `games.panel-arvello.space` $\rightarrow$ `A Record` ke `130.94.94.187` *(Proxy: ON)*
   - `admin.panel-arvello.space` $\rightarrow$ `A Record` ke `130.94.94.187` *(Proxy: ON)*
2. **Uji Coba di Browser**:
   - Buka `https://games.panel-arvello.space` (Akan membaca data dari DB Staging).
   - Buka `https://admin.panel-arvello.space` (Login admin staging).

---

## Langkah 6: Cutover Domain Production (Zero-Downtime)

Setelah Anda selesai menguji di staging dan merasa 100% puas:
1. Buka DNS Cloudflare untuk domain Production (`yowanastore.com`, `topupdisiniyuk.com`, dll.).
2. Ubah `A Record` domain-domain tersebut ke `130.94.94.187` *(Proxy: ON)*.
3. Trafik pengunjung akan langsung dialihkan ke `gamingstore-prod` di Port `3000` (DB Prod) tanpa ada downtime.

---

## Langkah 7: Skrip One-Click Deploy Terpisah

Agar update code di Staging dan Production tidak saling mengganggu:

### 7.1 Skrip Update Staging (`/var/www/deploy-staging.sh`)
```bash
nano /var/www/deploy-staging.sh
```
Isi:
```bash
#!/bin/bash
set -e
echo "🚀 Updating Staging (Port 3001)..."
cd /var/www/gamingstore-staging
git pull origin development
npm ci
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
pm2 reload gamingstore-staging
echo "✅ Staging Updated Successfully!"
```

### 7.2 Skrip Update Production (`/var/www/deploy-prod.sh`)
```bash
nano /var/www/deploy-prod.sh
```
Isi:
```bash
#!/bin/bash
set -e
echo "🚀 Updating Production (Port 3000)..."
cd /var/www/gamingstore-prod
git pull origin development
npm ci
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
pm2 reload gamingstore-prod
echo "✅ Production Updated Successfully!"
```

Beri izin eksekusi:
```bash
chmod +x /var/www/deploy-staging.sh /var/www/deploy-prod.sh
```

---

## Langkah 8: Monitoring & Maintenance

```bash
# Lihat status kedua environment
pm2 status

# Lihat realtime CPU/RAM kedua app
pm2 monit

# Lihat logs staging saja
pm2 logs gamingstore-staging

# Lihat logs prod saja
pm2 logs gamingstore-prod
```
