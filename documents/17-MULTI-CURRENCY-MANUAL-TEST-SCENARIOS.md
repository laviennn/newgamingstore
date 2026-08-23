# 17. Skenario Pengujian Manual (Manual Testing & QA) Multi-Currency

Dokumen ini berisi panduan dan skenario pengujian komprehensif (*End-to-End Test Plan*) untuk fitur **Multi-Currency & Multi-Region Storefront** sebelum dilakukan *deployment* ke *Production Environment*.

---

## 🎯 Tujuan Pengujian (Test Objectives)
1. Memastikan fitur **Multi-Currency & Multi-Region** berjalan 100% stabil, presisi, dan aman.
2. Memverifikasi pemisahan harga (*pricing matrix*), filter saluran pembayaran (*payment channels*), dan perutean CS WhatsApp (*regional CS routing*) per mata uang (`IDR`, `MYR`, `SGD`).
3. Memastikan tidak ada celah keamanan manipulasi harga lintas mata uang (*currency tampering* atau *rate mismatch*).
4. Memastikan pengalaman pengguna (*User Experience*) di Storefront mulus tanpa *hydration error*, *reload loop*, atau inkonsistensi tampilan.

---

## 📋 Matriks Lingkungan & Akun Pengujian

| Komponen | Data / Akun Uji |
|---|---|
| **Tenant Uji 1 (Multi-Currency)** | Staging Multi-Currency Store (`supported_currencies: ['IDR', 'MYR', 'SGD']`, `default_currency: 'IDR'`) |
| **Tenant Uji 2 (Single-Currency IDR)** | Staging Single IDR (`supported_currencies: ['IDR']`, `multi_currency_enabled: false`) |
| **Tenant Uji 3 (Single-Currency MYR)** | Staging Single MYR (`supported_currencies: ['MYR']`, `multi_currency_enabled: false`) |
| **Role Akun** | SuperAdmin, Tenant Admin, Member Biasa, Reseller, Guest (Non-Login) |
| **Browser Target** | Google Chrome (Desktop & Mobile Emulation), Safari / iOS, Edge |

---

## 🧪 Rincian Skenario Pengujian Manual

---

### MODUL 1: Admin Panel Configuration & Tenant Settings

#### Skenario 1.1: Pengaturan Multi-Currency di Halaman Tema (`/admin/theme`)
- **Tujuan**: Memastikan SuperAdmin/Admin dapat mengaktifkan multi-currency, memilih mata uang yang didukung, dan menentukan mata uang default.
- **Langkah Pengujian**:
  1. Login ke Admin Panel $\rightarrow$ Buka menu **Pengaturan Tema (`/admin/theme`)**.
  2. Cari kartu **Multi-Currency & Multi-Region**.
  3. Nyalakan switch **"Aktif"**.
  4. Centang mata uang: `🇮🇩 IDR (Rp)`, `🇲🇾 MYR (RM)`, dan `🇸🇬 SGD (S$)`.
  5. Pilih **Mata Uang Bawaan (Default)**: `IDR`.
  6. Klik **"Simpan Perubahan"**.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Muncul notifikasi sukses: *"Pengaturan tema & multi-currency berhasil diperbarui"*.
  - [ ] Di tabel database `tenants.theme_config`, tersimpan:
    `"multi_currency_enabled": true`, `"supported_currencies": ["IDR", "MYR", "SGD"]`, `"default_currency": "IDR"`.
  - [ ] Form input WhatsApp tidak lagi muncul di halaman `/admin/theme` (sudah bersih).

---

#### Skenario 1.2: Pengaturan WhatsApp CS Regional di Halaman Kontak (`/admin/contacts`)
- **Tujuan**: Memastikan input nomor WhatsApp CS muncul secara dinamis per wilayah hanya ketika Multi-Currency aktif.
- **Langkah Pengujian**:
  1. Buka menu **Kontak & Footer (`/admin/contacts`)**.
  2. Periksa kartu **Informasi Kontak & WhatsApp CS**.
  3. Pastikan terdapat badge `🌍 Multi-Region Active (IDR, MYR, SGD)`.
  4. Isi nomor WhatsApp per wilayah:
     - 🇮🇩 Indonesia (+62): `628123456789`
     - 🇲🇾 Malaysia (+60): `601234567890`
     - 🇸🇬 Singapura (+65): `6591234567`
  5. Klik **"Simpan Perubahan"**.
  6. Beralih ke Tenant yang Single-Currency, buka `/admin/contacts`.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Pada tenant Multi-Currency, tersimpan objek `theme_config.whatsapp_contacts` dengan 3 nomor tersebut.
  - [ ] Field utama `theme_config.whatsapp` otomatis tersinkronisasi dengan nomor default currency (`628123456789`).
  - [ ] Perubahan tercatat di **Audit Activity Logs** (`/admin/activity-logs`).
  - [ ] Pada tenant Single-Currency, tampilan otomatis berubah kembali menjadi 1 kolom input WhatsApp standar yang ringkas.

---

#### Skenario 1.3: Pengaturan Saluran Pembayaran Per Mata Uang (`/admin/payments`)
- **Tujuan**: Memastikan admin dapat menetapkan saluran pembayaran khusus mata uang tertentu.
- **Langkah Pengujian**:
  1. Buka menu **Saluran Pembayaran (`/admin/payments`)**.
  2. Edit atau Tambah Saluran Pembayaran:
     - **QRIS Auto / BCA Transfer**: Set mata uang ke `IDR`.
     - **DuitNow QR / Touch 'n Go / FPX**: Set mata uang ke `MYR`.
     - **PayNow**: Set mata uang ke `SGD`.
  3. Simpan masing-masing saluran pembayaran.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Saluran pembayaran tersimpan dengan kolom `currency` yang sesuai di tabel `payment_channels`.
  - [ ] Filter tab mata uang di tabel Admin Payments menampilkan daftar metode pembayaran yang relevan.

---

#### Skenario 1.4: Pengaturan Nama Item/Denominasi & Harga Produk SKU Per Wilayah (`/admin/products`)
- **Tujuan**: Memastikan admin dapat mengisi nama produk/denominasi item dan harga yang berbeda per wilayah (misal: 2.500 Diamonds seharga Rp 100.000 di IDR, sedangkan 4.650 Diamonds seharga RM 100 di MYR).
- **Langkah Pengujian**:
  1. Buka menu **Kelola Produk (`/admin/products`)** $\rightarrow$ Pilih salah satu Game (contoh: *Mobile Legends*).
  2. Edit salah satu produk.
  3. Pada kartu **Nama Item / Denominasi per Wilayah**, isi:
     - 🇮🇩 Item IDR: `2.500 Diamonds`
     - 🇲🇾 Item MYR: `4.650 Diamonds`
     - 🇸🇬 Item SGD: `250 Diamonds`
  4. Pada kartu **Harga Produk per Mata Uang**, isi:
     - Harga IDR: `Rp 100.000` (Original: `Rp 110.000`)
     - Harga MYR: `RM 100.00` (Original: `RM 115.00`)
     - Harga SGD: `S$ 30.00` (Original: `S$ 35.00`)
  5. Simpan produk.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Data nama item per wilayah tersimpan di database dalam kolom JSONB `products.names` (`{"IDR":"2.500 Diamonds","MYR":"4.650 Diamonds","SGD":"250 Diamonds"}`).
  - [ ] Data harga tersimpan di database dalam kolom JSONB `products.prices`.
  - [ ] Di tabel list produk admin (`/admin/products`), muncul badge indikator nama per wilayah (`🇮🇩 2.500 Diamonds 🇲🇾 4.650 Diamonds 🇸🇬 250 Diamonds`).
  - [ ] Di Storefront, ketika pengunjung memilih IDR tampil `2.500 Diamonds`, ketika memilih MYR tampil `4.650 Diamonds`.

---

#### Skenario 1.5: Dropdown Tenant & Flag Multi-Currency di Navbar Admin
- **Tujuan**: Memastikan SuperAdmin/Admin dapat melihat bendera seluruh mata uang aktif pada tenant Multi-Currency di dropdown header navbar.
- **Langkah Pengujian**:
  1. Buka Admin Panel di header navbar atas.
  2. Perhatikan dropdown **Tenant** dan badge status mata uang di sebelahnya.
  3. Buka dropdown pilihan tenant.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Tenant Multi-Currency (misal IDR & MYR) menampilkan gabungan bendera `🇮🇩🇲🇾` pada opsi dropdown dan badge aktif bertuliskan `🇮🇩🇲🇾 IDR • MYR`.
  - [ ] Tenant Multi-Currency 3 wilayah menampilkan bendera `🇮🇩🇲🇾🇸🇬` dan label `IDR • MYR • SGD`.
  - [ ] Tenant Single-Currency menampilkan bendera tunggal (misal `🇮🇩 IDR (Rp)` atau `🇲🇾 MYR (RM)`).

---

### MODUL 2: Storefront Currency Switcher & Caching

#### Skenario 2.1: Tampilan Currency Switcher di Header Desktop & Mobile Sidebar
- **Tujuan**: Memastikan tombol pemilih mata uang muncul secara responsif dan estetik.
- **Langkah Pengujian**:
  1. Buka Storefront Homepage (`/`) di browser desktop.
  2. Perhatikan area Navbar Desktop (sebelah kanan search bar).
  3. Ubah viewport ke mode Mobile (lebar < 768px).
  4. Buka Mobile Drawer / Sidebar via tombol menu burger di kiri atas.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Di desktop: Muncul pill dropdown dengan bendera dan kode mata uang aktif (contoh: `🇮🇩 IDR`).
  - [ ] Di mobile: Muncul pemilih mata uang di bagian header drawer mobile.
  - [ ] Pada tenant Single-Currency, tombol Currency Selector **otomatis disembunyikan** (*null*).

---

#### Skenario 2.2: Interaksi Pergantian Mata Uang & Cookie Persistence
- **Tujuan**: Memastikan perpindahan mata uang mengubah cookie dan memperbarui SSR/Client state.
- **Langkah Pengujian**:
  1. Di Storefront, klik tombol pemilih mata uang $\rightarrow$ Pilih **🇲🇾 MYR (RM)**.
  2. Buka DevTools $\rightarrow$ Tab *Application* $\rightarrow$ *Cookies*.
  3. Periksa nilai cookie `storefront_currency`.
  4. Lakukan Hard Reload halaman (*Cmd+Shift+R* / *Ctrl+F5*).
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Dropdown menampilkan checklist aktif pada mata uang yang dipilih.
  - [ ] Cookie `storefront_currency=MYR` tersimpan dengan `path=/`, `SameSite=Lax`, dan masa berlaku 30 hari.
  - [ ] Setelah reload, halaman tetap dalam mode mata uang **MYR**.
  - [ ] Tidak terjadi *reload loop* atau kedipan layar (*hydration flash*).

---

#### Skenario 2.3: Persistensi Lintas Halaman (*Cross-Page Navigation*)
- **Tujuan**: Memastikan mata uang yang dipilih tidak ter-reset saat pengunjung berpindah halaman.
- **Langkah Pengujian**:
  1. Pilih mata uang **🇲🇾 MYR**.
  2. Klik menu **Daftar Harga (`/prices`)**.
  3. Klik salah satu game untuk masuk ke **Detail Game (`/game/[slug]`)**.
  4. Klik menu **Cek Transaksi (`/track`)**.
  5. Kembali ke **Beranda (`/`)**.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Seluruh halaman menampilkan format mata uang `MYR (RM)` secara konsisten.
  - [ ] Tidak ada halaman yang mendadak kembali ke `IDR`.

---

### MODUL 3: Tampilan & Format Harga di Seluruh Komponen Storefront

#### Skenario 3.1: Flash Sale Section & Homepage Cards
- **Tujuan**: Memastikan format nominal dan coretan diskon tampil akurat.
- **Langkah Pengujian**:
  1. Pada mode **IDR**: Periksa card flash sale (Format: `Rp 50.000`, Coretan: `Rp 60.000`).
  2. Ganti mata uang ke **MYR**: Periksa card flash sale.
  3. Ganti mata uang ke **SGD**: Periksa card flash sale.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] IDR: Simbol `Rp `, tanpa desimal (kecuali diperlukan), pemisah ribuan titik (`Rp 20.000`).
  - [ ] MYR: Simbol `RM `, format desimal 2 digit (`RM 5.80`).
  - [ ] SGD: Simbol `S$ `, format desimal 2 digit (`S$ 1.80`).
  - [ ] Persentase hemat (*Discount Badge*) dihitung presisi berdasarkan harga mata uang yang bersangkutan.

---

#### Skenario 3.2: Halaman Daftar Harga (`/prices`)
- **Tujuan**: Memastikan tabel daftar harga merespon filter kategori dan mata uang aktif.
- **Langkah Pengujian**:
  1. Buka `/prices`.
  2. Beralih mata uang antara IDR, MYR, dan SGD.
  3. Cek tier harga Member Biasa, Reseller, dan VIP.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Seluruh kolom harga di tabel terkonversi ke simbol dan nominal mata uang yang dipilih.
  - [ ] Fitur *search* produk di halaman daftar harga tetap berfungsi normal.

---

#### Skenario 3.3: Global Search Dropdown
- **Tujuan**: Memastikan hasil pencarian instan di header menampilkan harga mata uang yang aktif.
- **Langkah Pengujian**:
  1. Ketik nama game di search bar header (contoh: "Mobile").
  2. Lihat pratinjau harga termurah (*"Mulai dari..."*) di popover hasil pencarian.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Teks *"Mulai dari Rp X"* berubah sesuai mata uang aktif (*"Mulai dari RM Y"* atau *"Mulai dari S$ Z"*).

---

### MODUL 4: Alur Checkout Game & Transaksi

#### Skenario 4.1: Filter Saluran Pembayaran di Halaman Game (`/game/[slug]`)
- **Tujuan**: Memastikan pengunjung hanya melihat metode pembayaran yang valid untuk mata uangnya.
- **Langkah Pengujian**:
  1. Buka halaman game `/game/mobile-legends`.
  2. Pilih salah satu nominal produk.
  3. Dalam mode **IDR**: Periksa accordion metode pembayaran.
  4. Ganti mata uang ke **MYR**: Periksa accordion metode pembayaran.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Mode IDR: Menampilkan QRIS, Transfer Bank Indonesia (BCA/Mandiri/BRI), E-Wallet IDR.
  - [ ] Mode MYR: Menampilkan DuitNow QR, Touch 'n Go, FPX Online Banking Malaysia.
  - [ ] Mode SGD: Menampilkan PayNow / Bank Transfer SG.
  - [ ] Saluran pembayaran dari mata uang lain **disembunyikan otomatis** untuk mencegah salah transfer.

---

#### Skenario 4.2: Pembuatan Pesanan & Nilai Database (`orders`)
- **Tujuan**: Memastikan data pesanan tersimpan dengan currency dan nominal yang sah di database.
- **Langkah Pengujian**:
  1. Dalam mode **MYR**, pilih produk seharga `RM 10.00`.
  2. Pilih metode pembayaran `DuitNow QR`.
  3. Masukkan Data User ID / No. WhatsApp $\rightarrow$ Klik **"Beli Sekarang"**.
  4. Buka halaman faktur `/checkout/[id]`.
  5. Cek record di tabel `orders` database Supabase.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Kolom `orders.currency` bernilai `'MYR'`.
  - [ ] Kolom `orders.total_amount` / `price` bernilai `10.00` (bukan harga IDR).
  - [ ] Kode unik pembayaran (jika aktif) dihitung secara wajar sesuai rentang mata uang.

---

#### Skenario 4.3: Halaman Faktur Checkout & Konfirmasi WhatsApp
- **Tujuan**: Memastikan invoice menampilkan rincian pembayaran dalam mata uang yang tepat dan mengarahkan ke CS yang benar.
- **Langkah Pengujian**:
  1. Pada halaman `/checkout/[id]` pesanan MYR:
  2. Verifikasi ringkasan total pembayaran.
  3. Unggah bukti transfer $\rightarrow$ Klik tombol **"Konfirmasi via WhatsApp"**.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Total tagihan berformat `RM 10.00`.
  - [ ] Tautan WhatsApp mengarah ke nomor CS Malaysia (`601234567890`).
  - [ ] Template pesan WhatsApp terisi otomatis dengan format invoice, nominal `RM 10.00`, dan link bukti transfer.

---

### MODUL 5: Area Member, Saldo Deposit, & Upgrade Membership

#### Skenario 5.1: Alur Deposit Saldo Member (`/member/deposit`)
- **Tujuan**: Memastikan formulir deposit memproses nominal dan saluran pembayaran sesuai mata uang aktif.
- **Langkah Pengujian**:
  1. Login sebagai Member $\rightarrow$ Buka menu **Deposit Saldo (`/member/deposit`)**.
  2. Pilih nominal deposit atau ketik manual.
  3. Pilih saluran pembayaran yang tersedia untuk mata uang aktif.
  4. Klik **"Lanjutkan Pembayaran"** $\rightarrow$ Masuk ke `/deposit-checkout/[id]`.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Record `deposits.currency` tercatat sesuai mata uang yang dipilih.
  - [ ] Halaman instruksi deposit menampilkan nominal dan nomor rekening/QR yang sesuai.
  - [ ] Tombol konfirmasi WhatsApp di invoice deposit mengarah ke CS wilayah terkait.

---

#### Skenario 5.2: Riwayat Transaksi Member (`/member/transactions` & `/member/deposits`)
- **Tujuan**: Memastikan tabel riwayat transaksi menampilkan mata uang asli dari transaksi tersebut.
- **Langkah Pengujian**:
  1. Buka menu **Riwayat Transaksi**.
  2. Periksa baris transaksi IDR lama dan transaksi MYR baru.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Transaksi masa lalu tetap menampilkan simbol aslinya (misal transaksi IDR lama tetap `Rp 50.000`, transaksi MYR tetap `RM 15.00`).
  - [ ] Status badge (Pending, Success, Failed) tetap terbaca jelas.

---

#### Skenario 5.3: Halaman Upgrade Level Membership (`/member/upgrade`)
- **Tujuan**: Memastikan paket upgrade level (Reseller / VIP / Distributor) menampilkan biaya upgrade dalam mata uang aktif.
- **Langkah Pengujian**:
  1. Buka menu **Upgrade Akun (`/member/upgrade`)**.
  2. Beralih mata uang antara IDR dan MYR.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Biaya pendaftaran paket upgrade tertera dalam nominal mata uang aktif.
  - [ ] Checkout upgrade berjalan mulus hingga status member ter-upgrade.

---

### MODUL 6: Floating Widget & Komponen Kontak Global

#### Skenario 6.1: Widget Floating WhatsApp di Kiri Bawah & Footer Link
- **Tujuan**: Memastikan tombol bantuan interaktif selalu mengarahkan ke CS yang sesuai dengan preferensi mata uang pengunjung.
- **Langkah Pengujian**:
  1. Buka Storefront Homepage.
  2. Set mata uang ke **IDR** $\rightarrow$ Klik widget **Floating WhatsApp** di kanan bawah.
  3. Kembali ke toko $\rightarrow$ Ganti mata uang ke **MYR** $\rightarrow$ Klik widget **Floating WhatsApp**.
  4. Periksa tautan WhatsApp di bagian Footer.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Saat IDR: Mengarahkan ke `wa.me/628123456789`.
  - [ ] Saat MYR: Mengarahkan ke `wa.me/601234567890`.
  - [ ] Saat SGD: Mengarahkan ke `wa.me/6591234567`.
  - [ ] Jika nomor SGD kosong, sistem otomatis *fallback* ke nomor WhatsApp default tanpa error.

---

### MODUL 7: Edge Cases & Pengujian Keamanan (Security & Negative Testing)

#### Skenario 7.1: Manipulasi Cookie (*Cookie Tampering*)
- **Tujuan**: Memastikan sistem kebal terhadap injeksi nilai cookie mata uang yang tidak valid.
- **Langkah Pengujian**:
  1. Buka DevTools $\rightarrow$ Edit cookie `storefront_currency` secara manual menjadi `USD` atau `HACKER` atau string kosong.
  2. Refresh halaman toko.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Halaman tidak crash / tidak error 500.
  - [ ] Sistem otomatis *fallback* ke `default_currency` tenant (contoh: `IDR`).

---

#### Skenario 7.2: Akses Saluran Pembayaran Tidak Sah via API / Manipulasi Form (*Cross-Currency Checkout Tampering*)
- **Tujuan**: Mencegah penipuan di mana pembeli memesan produk seharga `RM 10.00` tetapi mencoba membayarnya dengan `Rp 10.00` QRIS IDR.
- **Langkah Pengujian**:
  1. Lakukan request checkout dengan `payment_channel_id` milik IDR, tetapi `currency` diset ke `MYR`.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Server Action menolak transaksi atau memvalidasi kecocokan mata uang saluran pembayaran sebelum membuat invoice.

---

#### Skenario 7.3: Isolasi Tenant Single-Currency (*Tenant Isolation Check*)
- **Tujuan**: Memastikan toko yang tidak mengaktifkan multi-currency tetap beroperasi murni sebagai single currency tanpa kebocoran fitur.
- **Langkah Pengujian**:
  1. Buka domain toko yang Single-Currency (`multi_currency_enabled: false`).
  2. Periksa Header, Footer, Halaman Game, dan Checkout.
- **Kriteria Keberhasilan (Expected Result)**:
  - [ ] Tidak ada pemilih mata uang di Header / Sidebar.
  - [ ] Semua harga tampil dalam 1 mata uang asli toko tersebut.
  - [ ] Tidak ada nomor WhatsApp selain nomor utama toko.

---

## 📊 Lembar Ceklis Kesiapan Produksi (Go-Live Checklist)

| No | Kategori Pengujian | Status (PASS/FAIL) | Catatan Tester |
|:--:|---|:---:|---|
| 1 | Konfigurasi Multi-Currency di `/admin/theme` | `[ ] PASS` | |
| 2 | Pengaturan WhatsApp Regional di `/admin/contacts` | `[ ] PASS` | |
| 3 | Pengaturan Channel Pembayaran per Currency di `/admin/payments` | `[ ] PASS` | |
| 4 | Pengaturan Harga SKU Produk per Currency di `/admin/products` | `[ ] PASS` | |
| 5 | Currency Switcher Desktop & Mobile Sidebar | `[ ] PASS` | |
| 6 | Cookie `storefront_currency` Persistence (30 Hari) | `[ ] PASS` | |
| 7 | Format Tampilan Harga (IDR `Rp`, MYR `RM`, SGD `S$`) | `[ ] PASS` | |
| 8 | Filter Channel Pembayaran di Halaman Game | `[ ] PASS` | |
| 9 | Pembuatan Order & Invoice Checkout (`/checkout/[id]`) | `[ ] PASS` | |
| 10 | Integrasi Upload Bukti & Redirect WA CS Regional | `[ ] PASS` | |
| 11 | Alur Deposit Member (`/member/deposit`) | `[ ] PASS` | |
| 12 | Riwayat Transaksi & Upgrade Membership | `[ ] PASS` | |
| 13 | Floating WhatsApp & Footer WA Dynamic Routing | `[ ] PASS` | |
| 14 | Security Test: Cookie Tampering & Negative Scenarios | `[ ] PASS` | |
| 15 | Single Currency Tenant Backward Compatibility | `[ ] PASS` | |

---

> 🚀 **Rekomendasi Deployment**:
> Lakukan pengujian manual di lingkungan *Staging* mengikuti seluruh skenario di atas. Setelah seluruh poin mendapatkan status **`[x] PASS`**, sistem siap untuk di-deploy ke *Production*.
