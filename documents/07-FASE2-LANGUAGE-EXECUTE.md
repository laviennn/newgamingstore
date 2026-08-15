# 07 - IMPLEMENTATION PLAN FASE 2: STOREFRONT LANGUAGE SYSTEM (SINGLE-LANGUAGE PER TENANT)

Dokumen ini berisi rencana eksekusi teknis untuk implementasi **Sistem Bahasa Storefront (Single-Language per Tenant)** pada aplikasi Multi-Tenant NewGamingStore.

---

## 1. Ringkasan Fitur & Prinsip Utamanya
- **Prinsip Utama**: Bahasa storefront ditentukan secara terpusat oleh Admin BO per-tenant (*Single Language per Tenant*). Pengunjung tidak memerlukan switcher di storefront.
- **Pilihan Bahasa**:
  1. `id` : Bahasa Indonesia (Default)
  2. `ms` : Bahasa Melayu / Malaysia
- **Pembaruan Visual Otomatis**:
  - Saat `id`: Menampilkan Badge Footer **Bendera Indonesia + "Indonesia / IDR"**.
  - Saat `ms`: Menampilkan Badge Footer **Bendera Malaysia + "Malaysia / MYR"**.
- **Pencegahan FOUC & Keamanan Data**:
  - Menggunakan *fallback* aman ke `"id"` jika data `language` belum terisi pada tenant tertentu.
  - Menggunakan kolom JSONB `theme_config` pada tabel `tenants` yang sudah ada (Zero DB Schema Risk / Tanpa Migrasi SQL).

---

## 2. Pemetaan Teks Statis per Seksi (Storefront, Auth, Checkout & Member Portal Mapping)

Berikut adalah pemetaan lengkap seluruh teks statis yang terdapat pada Halaman Utama, `/track`, `/prices`, `/login`, `/register`, `/game/[slug]`, `/checkout/[id]`, `UserDropdown.tsx`, serta seluruh Halaman Member Portal (`/member/dashboard`, `/member/deposit`, `/member/transactions`, `/member/upgrade`) yang dikontrol oleh modul kamus bahasa:

### HOMEPAGE -- SECTION NAVIGASI & HEADER --
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `nav_home` | Beranda | Utama |
| `nav_check_invoice` | Cek Transaksi | Semak Pesanan |
| `nav_price_list` | Daftar Harga | Senarai Harga |
| `nav_blog` | Blog | Blog |
| `search_placeholder` | Cari game favoritmu... | Cari permainan kegemaran anda... |
| `btn_login` | Masuk | Log Masuk |
| `btn_register` | Daftar | Daftar |

### HOMEPAGE -- SECTION PROMO & SPANDUK --
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `promo_subtitle` | Dapatkan diskon spesial untuk top-up pertamamu! | Dapatkan diskaun istimewa untuk topup pertama anda! |
| `promo_code_label` | Gunakan Kode: | Guna Kod: |

### HOMEPAGE -- SECTION POPULER & FLASH SALE --
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `popular_title` | POPULER! | POPULAR! |
| `popular_desc` | Beberapa produk yang paling populer saat ini. | Beberapa produk yang paling popular ketika ini. |
| `timer_days` | HARI | HARI |
| `timer_hours` | JAM | JAM |
| `timer_minutes` | MNT | MIN |
| `timer_seconds` | DTK | SAAT |
| `stock_remaining` | TERSISA | BAKI |

### HOMEPAGE -- SECTION KATEGORI & ARTIKEL --
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `category_empty` | Tidak ada game di kategori ini. | Tiada permainan dalam kategori ini. |
| `articles_title` | ARTIKEL TERBARU | ARTIKEL TERKINI |
| `articles_desc` | Dapatkan informasi terbaru seputar dunia game! Temukan panduan lengkap untuk meningkatkan pengalaman bermain, serta berita terkini mengenai promo, update top-up, dan komunitas gamer. | Dapatkan maklumat terkini seputar dunia permainan! Cari panduan lengkap untuk meningkatkan pengalaman bermain, serta berita terkini mengenai promosi, kemas kini topup, dan komuniti gamer. |
| `btn_all_articles` | Lihat Semua Artikel | Lihat Semua Artikel |

### HOMEPAGE -- SECTION FAQ (SERING DITANYAKAN) --
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `faq_title` | Sering Ditanyakan | Soalan Lazim |
| `faq_desc` | Punya pertanyaan? Kami punya jawabannya. Berikut adalah hal-hal yang sering ditanyakan oleh pengguna kami. | Ada soalan? Kami ada jawapannya. Berikut adalah soalan yang kerap ditanya oleh pengguna kami. |

### HOMEPAGE -- SECTION FOOTER & FOOTER BADGE --
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `footer_desc` | Platform top up game terlengkap, cepat & termurah di Indonesia dengan layanan 24/7. | Platform topup permainan paling lengkap, pantas & termurah dengan perkhidmatan 24/7. |
| `footer_payment_title` | Pembayaran Aman | Pembayaran Selamat |
| `footer_payment_more` | lainnya | lagi |
| `footer_help_title` | Butuh Bantuan? | Perlukan Bantuan? |
| `footer_wa_btn` | Chat WhatsApp | Sembang WhatsApp |
| `footer_hours_label` | Jam Operasional: | Waktu Operasi: |
| `footer_guarantee_title` | Jaminan Transaksi | Jaminan Transaksi |
| `footer_guarantee_desc` | Garansi uang kembali 100% apabila layanan gagal terkirim karena kesalahan sistem. | Jaminan wang dikembalikan 100% jika perkhidmatan gagal dihantar akibat ralat sistem. |
| `footer_security_badge` | 100% Legal & Aman | 100% Legal & Selamat |
| `footer_social_title` | Sosial Media | Media Sosial |
| `footer_terms` | Syarat & Ketentuan | Terma & Syarat |
| `footer_privacy` | Kebijakan Privasi | Dasar Privasi |
| `footer_copyright` | All Rights Reserved. | Hak Cipta Terpelihara. |
| `footer_country_badge` | Indonesia / IDR | Malaysia / MYR |

---

### HALAMAN `/track` (LACAK PESANAN)
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `track_title` | Lacak Pesanan | Semak Pesanan |
| `track_desc` | Pantau status transaksi top-up atau voucher Anda secara real-time. Masukkan nomor Invoice yang Anda dapatkan saat checkout. | Jejak status transaksi topup atau baucar anda secara masa nyata. Masukkan nombor Invois yang anda dapatkan semasa daftar keluar. |
| `track_placeholder` | Masukkan Invoice ID (Cth: NGS26...) | Masukkan ID Invois (Cth: NGS26...) |
| `track_btn` | Lacak | Cari |
| `track_not_found_title` | Pesanan Tidak Ditemukan | Pesanan Tidak Ditemui |
| `track_not_found_desc` | Pastikan Invoice ID yang dimasukkan sudah benar dan sesuai dengan struk pembelian Anda. | Pastikan ID Invois yang dimasukkan adalah betul dan padan dengan resit pembelian anda. |
| `track_date_label` | TANGGAL PEMBELIAN | TARIKH PEMBELIAN |
| `track_payment_status` | Status Pembayaran | Status Pembayaran |
| `track_process_status` | Status Proses | Status Proses |
| `track_account_detail` | Detail Akun | Maklumat Akaun |
| `track_payment_proof` | Bukti Pembayaran | Bukti Pembayaran |
| `track_total_price` | Total Harga | Jumlah Harga |
| `track_unpaid_notice` | Pesanan Anda belum dibayar. Selesaikan pembayaran untuk memproses pesanan. | Pesanan anda belum dibayar. Selesaikan pembayaran untuk memproses pesanan. |
| `track_pay_now_btn` | Lanjut ke Halaman Pembayaran | Teruskan ke Halaman Pembayaran |
| `track_success_notice` | Transaksi berhasil! Terima kasih telah berbelanja di NewGamingStore. | Transaksi berjaya! Terima kasih kerana membeli-belah bersama kami. |
| `track_full_invoice_btn`| Lihat Detail Invoice Penuh | Lihat Maklumat Invois Penuh |

---

### HALAMAN `/prices` (DAFTAR HARGA)
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `prices_title` | Daftar Harga Layanan | Senarai Harga Perkhidmatan |
| `prices_desc` | Temukan harga terbaik untuk semua game favorit Anda. Kami menawarkan berbagai level keanggotaan dengan diskon eksklusif yang menguntungkan. | Cari harga terbaik untuk semua permainan kegemaran anda. Kami menawarkan pelbagai tahap keahlian dengan diskaun eksklusif. |
| `prices_filter_game` | Filter Game | Penapis Permainan |
| `prices_filter_desc` | Pilih kategori game untuk menyaring tabel. | Pilih kategori permainan untuk menapis jadual. |
| `prices_search_sku` | Cari Layanan/SKU... | Cari Perkhidmatan/SKU... |
| `prices_cat_all` | Semua Kategori | Semua Kategori |
| `prices_th_sku` | Kode / SKU | Kod / SKU |
| `prices_th_service` | Nama Layanan | Nama Perkhidmatan |
| `prices_th_guest` | Harga Tamu | Harga Tetamu |
| `prices_th_member` | Member | Ahli |
| `prices_th_platinum` | Platinum | Platinum |
| `prices_th_gold` | Gold | Emas |
| `prices_th_status` | Status | Status |
| `prices_status_ready` | READY | SEDIA |
| `prices_empty` | Tidak ada layanan yang sesuai dengan filter/pencarian Anda. | Tiada perkhidmatan yang padan dengan penapis/carian anda. |
| `prices_pagination` | Menampilkan {count} dari {total} layanan | Menunjukkan {count} daripada {total} perkhidmatan |

---

### HALAMAN `/login` & `/register` (`AuthCard.tsx`)
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `auth_banner_title` | NewGamingStore | NewGamingStore |
| `auth_banner_desc` | NEWGAMINGSTORE \| Platform Top Up Game & Voucher Terpercaya | NEWGAMINGSTORE \| Platform Topup Permainan & Baucar Dipercayai |
| `auth_login_title` | Login Member | Log Masuk Ahli |
| `auth_login_subtitle` | Silakan masuk untuk melanjutkan. | Sila log masuk untuk meneruskan. |
| `auth_login_user_sub` | Masuk dengan username dan password Anda. | Log masuk dengan nama pengguna dan kata laluan anda. |
| `auth_reg_title` | Buat Akun | Daftar Akaun |
| `auth_reg_subtitle` | Daftar sekarang untuk memulai. | Daftar sekarang untuk bermula. |
| `auth_wa_notice` | Pendaftaran akun hanya tersedia melalui Admin. Hubungi kami untuk mendaftar. | Pendaftaran akaun hanya boleh dilakukan melalui Admin. Hubungi kami untuk mendaftar. |
| `auth_wa_btn` | Hubungi Admin via WhatsApp | Hubungi Admin melalui WhatsApp |
| `auth_label_name` | Nama Lengkap | Nama Penuh |
| `auth_label_phone` | Nomor Telepon (WhatsApp) | Nombor Telefon (WhatsApp) |
| `auth_phone_err_format`| Nomor harus diawali 08, 62, atau +62 | Nombor mesti bermula dengan 08, 62, atau +62 |
| `auth_phone_err_length`| Panjang nomor harus 10-15 digit | Panjang nombor mestilah 10-15 digit |
| `auth_label_username` | Username | Nama Pengguna |
| `auth_label_email` | Email | E-mel |
| `auth_label_password` | Password | Kata Laluan |
| `auth_ph_password` | Masukkan password | Masukkan kata laluan |
| `auth_remember_me` | Ingat Saya | Ingat Saya |
| `auth_forgot_pass` | Lupa Password? | Lupa Kata Laluan? |
| `auth_btn_processing` | MEMPROSES... | MEMPROSES... |
| `auth_btn_login` | MASUK SEKARANG | LOG MASUK SEKARANG |
| `auth_btn_register` | DAFTAR SEKARANG | DAFTAR SEKARANG |
| `auth_no_account` | Belum punya akun? | Belum ada akaun? |
| `auth_has_account` | Sudah punya akun? | Sudah ada akaun? |
| `auth_link_register` | Daftar sekarang | Daftar sekarang |
| `auth_link_login` | Masuk sekarang | Log masuk sekarang |

---

### HALAMAN DETAIL GAME (`/game/[slug]`)
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `game_fast_process` | Proses Cepat | Proses Pantas |
| `game_chat_support` | Layanan Chat 24/7 | Perkhidmatan Sembang 24/7 |
| `game_official_product`| Produk Resmi | Produk Rasmi |
| `game_guide_btn` | Lihat Panduan Pengisian | Lihat Panduan Pengisian |
| `game_guide_title` | Panduan Pengisian | Panduan Pengisian |
| `game_price_label` | Harga | Harga |
| `game_empty_products` | Belum ada produk top-up yang tersedia. | Belum ada produk topup yang tersedia. |
| `game_member_only` | Khusus Member | Khusus Ahli |
| `game_free_admin_fee` | Bebas Biaya Admin | Bebas Yuran Admin |
| `game_empty_payments` | Belum ada metode pembayaran yang tersedia. | Belum ada kaedah pembayaran yang tersedia. |
| `game_wa_placeholder` | 628 | 601 |
| `game_wa_note` | *Contoh: 62821xxxxxxxxx (No WhatsApp wajib diisi) | *Contoh: 60123xxxxxxx (No. WhatsApp wajib diisi) |
| `game_wa_info` | Informasi: Bukti transaksi akan kami kirim ke WhatsApp atau email yang kamu isi di atas. | Maklumat: Bukti transaksi akan dihantar ke WhatsApp atau e-mel yang anda isi di atas. |
| `game_promo_btn_check` | Gunakan | Guna |
| `game_promo_checking` | Cek... | Semak... |
| `game_promo_avail_btn` | Cek Promo Yang Tersedia | Semak Promo Yang Ada |
| `game_promo_modal_title`| Promo Tersedia | Promo Yang Ada |
| `game_promo_modal_empty`| Tidak ada promo yang tersedia saat ini. | Tiada promo yang ada ketika ini. |
| `game_promo_select` | Pilih | Pilih |
| `game_bar_select_prompt`| Pilih Nominal & Pembayaran | Pilih Nilai & Pembayaran |
| `game_sticky_instant` | **Waktu proses instan | **Masa proses serta-merta |
| `game_sticky_checking` | Mengecek... | Semakan... |
| `game_order_now` | Pesan Sekarang! | Pesan Sekarang! |
| `game_sticky_empty` | Silakan pilih nominal Top Up dan Pembayaran terlebih dahulu. | Sila pilih nilai Topup dan Pembayaran terlebih dahulu. |
| `game_confirm_title` | Buat Pesanan | Buat Pesanan |
| `game_confirm_sub` | Pastikan data akun Anda dan produk yang Anda pilih valid dan sesuai. | Pastikan maklumat akaun anda dan produk yang anda pilih adalah sah dan betul. |
| `game_confirm_player` | Data Player | Maklumat Pemain |
| `game_confirm_summary` | Ringkasan Pembelian | Ringkasan Pembelian |
| `game_confirm_btn` | Pesan Sekarang | Pesan Sekarang |
| `game_confirm_cancel` | Batal | Batal |

---

### HALAMAN CHECKOUT / INVOICE (`/checkout/[id]`)
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `checkout_progress_title` | Progress Transaksi | Kemajuan Transaksi |
| `checkout_step1_title` | Transaksi Dibuat | Transaksi Dicipta |
| `checkout_step1_desc` | Transaksi telah berhasil dibuat | Transaksi telah berjaya dicipta |
| `checkout_step2_title` | Pembayaran | Pembayaran |
| `checkout_step2_desc` | Silakan melakukan pembayaran | Sila buat pembayaran |
| `checkout_step3_title` | Sedang Di Proses | Dalam Proses |
| `checkout_step3_desc` | Pembelian sedang dalam proses. | Pembelian sedang dalam proses. |
| `checkout_step4_title` | Transaksi Selesai | Transaksi Selesai |
| `checkout_step4_desc` | Transaksi telah berhasil dilakukan. | Transaksi telah berjaya dilakukan. |
| `checkout_acc_info` | Informasi Akun | Maklumat Akaun |
| `checkout_service_label` | Layanan : | Perkhidmatan : |
| `checkout_details_title` | Rincian Pembayaran | Butiran Pembayaran |
| `checkout_price_item` | Harga | Harga |
| `checkout_qty_item` | Jumlah | Kuantiti |
| `checkout_point_discount` | Potongan Point | Potongan Mata |
| `checkout_voucher_discount`| Potongan Voucher | Potongan Baucar |
| `checkout_subtotal` | Subtotal | Jumlah Keseluruhan |
| `checkout_download_btn` | Unduh Invoice | Muat Turun Invois |
| `checkout_method_title` | Metode Pembayaran | Kaedah Pembayaran |
| `checkout_invoice_no` | Nomor Invoice | Nombor Invois |
| `checkout_payment_status`| Status Pembayaran | Status Pembayaran |
| `checkout_trx_status` | Status Transaksi | Status Transaksi |
| `checkout_voucher_note` | Kode Voucher / Catatan | Kod Baucar / Catatan |
| `checkout_promo_used` | Promo Digunakan | Promo Digunakan |
| `checkout_wait_payment` | Menunggu pembayaran | Menunggu pembayaran |
| `checkout_qris_scan` | SCAN UNTUK MEMBAYAR | IMBAS UNTUK MEMBAYAR |
| `checkout_qris_not_set` | QRIS Belum Diatur | QRIS Belum Diatur |
| `checkout_qris_warn_title`| ⚠️ Perhatian Khusus QRIS Static: | ⚠️ Perhatian Khusus QRIS Statik: |
| `checkout_qris_warn_desc` | Saat memindai QRIS ini di aplikasi M-Banking/E-Wallet Anda, Anda WAJIB MENGETIK NOMINAL TAGIHAN SECARA MANUAL. Pastikan nominal transfer TEPAT: | Semasa mengimbas QRIS ini dalam aplikasi M-Banking/E-Wallet anda, anda WAJIB MENAIP JUMLAH TAGIHAN SECARA MANUAL. Pastikan jumlah pindahan TEPAT: |
| `checkout_qris_save_btn` | Simpan QRIS ke Galeri | Simpan QRIS ke Galeri |
| `checkout_wallet_title` | PEMBAYARAN SALDO AKUN | PEMBAYARAN BAKI AKAUN |
| `checkout_wallet_desc` | Tagihan akan dipotong dari Saldo Akun secara otomatis. | Tagihan akan ditolak daripada Baki Akaun secara automatik. |
| `checkout_wallet_wait` | Mohon tunggu sistem memproses transaksi Anda. | Sila tunggu sistem memproses transaksi anda. |
| `checkout_bank_transfer` | Silakan transfer pembayaran ke rekening berikut: | Sila pindah pembayaran ke akaun berikut: |
| `checkout_confirm_title` | Konfirmasi Pembayaran | Pengesahan Pembayaran |
| `checkout_confirm_desc` | Silakan unggah bukti transfer Anda agar pesanan dapat segera kami proses. | Sila muat naik bukti pindahan anda supaya pesanan boleh diproses segera. |
| `checkout_change_img` | Ganti Gambar | Tukar Gambar |
| `checkout_click_upload` | Klik untuk upload bukti | Klik untuk muat naik bukti |
| `checkout_uploading` | Mengunggah... | Memuat naik... |
| `checkout_size_limit` | Maksimal ukuran foto 2MB (JPG, PNG, WEBP) | Saiz foto maksimum 2MB (JPG, PNG, WEBP) |
| `checkout_confirm_wa` | Konfirmasi via WhatsApp | Pengesahan melalui WhatsApp |
| `checkout_tracking_btn` | Tracking Order | Jejak Pesanan |

---

### COMPONENT USER PROFILE DROPDOWN (`UserDropdown.tsx`)
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `user_account_header` | AKUN ANDA | AKAUN ANDA |
| `user_dashboard` | Dashboard Member | Papan Pemuka Ahli |
| `user_wallet_balance` | Saldo Akun | Baki Akaun |
| `user_transactions` | Riwayat Transaksi | Sejarah Transaksi |
| `user_deposits` | Riwayat Deposit | Sejarah Deposit |
| `user_upgrade` | Upgrade Membership | Tingkat Keahlian |
| `user_settings` | Pengaturan Profile | Tetapan Profil |
| `user_logout` | Keluar | Log Keluar |
| `user_logout_pending` | Keluar... | Log Keluar... |

---

### MEMBER PORTAL (`/member/*`)
| Key Dictionary | 🇮🇩 Bahasa Indonesia (`id`) | 🇲🇾 Bahasa Melayu (`ms`) |
| :--- | :--- | :--- |
| `member_nav_dashboard` | Dashboard | Papan Pemuka |
| `member_nav_deposit` | Deposit | Deposit |
| `member_nav_transactions`| Riwayat Transaksi | Sejarah Transaksi |
| `member_nav_deposits` | Riwayat Deposit | Sejarah Deposit |
| `member_nav_upgrade` | Upgrade Membership | Tingkat Keahlian |
| `member_upgrade_banner_t`| Tingkatkan Level Membership Anda | Tingkatkan Tahap Keahlian Anda |
| `member_upgrade_banner_d`| Anda saat ini berada di Level | Anda kini berada di Tahap |
| `member_upgrade_btn` | Upgrade Membership | Tingkat Keahlian |
| `member_active_banner_t` | Membership Anda | Keahlian Anda |
| `member_active_banner_d` | Nikmati berbagai benefit khusus untuk level Anda. | Nikmati pelbagai faedah khas untuk tahap anda. |
| `member_active_btn` | Lihat Paket Lain | Lihat Pakej Lain |
| `member_wa_channel_t` | Gabung Channel WhatsApp | Sertai Saluran WhatsApp |
| `member_wa_channel_d` | Dapatkan info promo, kode voucher, dan update terbaru langsung di WhatsApp. | Dapatkan info promosi, kod baucar, dan kemas kini terkini terus di WhatsApp. |
| `member_wa_channel_btn` | Gabung Sekarang | Sertai Sekarang |
| `member_card_id` | MEMBER ID | ID AHLI |
| `member_card_setting` | Atur Profil | Tetapkan Profil |
| `member_since` | Member sejak: | Ahli sejak: |
| `member_wallet_title` | Dompet Anda | Dompet Anda |
| `member_wallet_balance` | SALDO AKUN | BAKI AKAUN |
| `member_stats_title` | Statistik Transaksi Hari Ini | Statistik Transaksi Hari Ini |
| `member_stat_waiting` | MENUNGGU | MENUNGGU |
| `member_stat_processed` | DALAM PROSES | DALAM PROSES |
| `member_stat_success` | SUKSES | BERJAYA |
| `member_stat_failed` | GAGAL | GAGAL |
| `member_stat_total_trx` | Total Transaksi | Jumlah Transaksi |
| `member_stat_total_sale`| Total Penjualan | Jumlah Pembelian |
| `member_dep_title` | Deposit Saldo | Deposit Baki |
| `member_dep_desc` | Isi saldo akun Anda untuk transaksi lebih cepat. | Isi baki akaun anda untuk transaksi lebih pantas. |
| `member_dep_current_bal` | SALDO SAAT INI | BAKI KINI |
| `member_dep_step1` | Pilih Nominal Deposit | Pilih Nilai Deposit |
| `member_dep_custom_lbl` | Atau Masukkan Nominal Khusus (Min. Rp 10.000) | Atau Masukkan Nilai Khas (Min. Rp 10.000) |
| `member_dep_custom_ph` | Contoh: 150000 | Contoh: 150000 |
| `member_dep_confirm_t` | Konfirmasi Deposit | Pengesahan Deposit |
| `member_dep_confirm_sub` | Pastikan data berikut sudah benar sebelum melanjutkan. | Pastikan maklumat berikut adalah betul sebelum meneruskan. |
| `member_dep_submit_btn` | Proses Deposit | Proses Deposit |
| `member_trx_filter_btn` | Filter Data | Tapis Data |
| `member_trx_reset_btn` | Reset | Set Semula |
| `member_trx_th_inv` | NOMOR INVOICE | NOMBOR INVOIS |
| `member_trx_th_item` | ITEM / GAME | ITEM / PERMAINAN |
| `member_trx_th_target` | TARGET | SASARAN |
| `member_trx_th_total` | TOTAL BAYAR | JUMLAH BAYAR |
| `member_trx_th_date` | TANGGAL | TARIKH |
| `member_trx_th_status` | STATUS | STATUS |
| `member_trx_empty` | Tidak ada riwayat transaksi yang ditemukan. | Tiada sejarah transaksi ditemui. |
| `member_upg_badge` | SUBSCRIPTION | LANGGANAN |
| `member_upg_title` | Upgrade Membership | Tingkat Keahlian |
| `member_upg_role` | Current Role: | Peranan Semasa: |
| `member_upg_sel_pkg` | PILIH PAKET | PILIH PAKEJ |
| `member_upg_submit_btn` | Proses Upgrade Sekarang | Proses Tingkat Sekarang |

---

## 3. Modul Kamus Bahasa Terpusat (`src/lib/dictionary.ts`)

File kamus baru yang menyediakan terjemahan seluruh elemen teks pada Storefront & Member Portal:

```typescript
export type Language = "id" | "ms";

export const dictionaries = {
  id: {
    // Header & Navigation
    nav_home: "Beranda",
    nav_check_invoice: "Cek Transaksi",
    nav_price_list: "Daftar Harga",
    nav_blog: "Blog",
    search_placeholder: "Cari game favoritmu...",
    btn_login: "Masuk",
    btn_register: "Daftar",
    
    // Promo
    promo_subtitle: "Dapatkan diskon spesial untuk top-up pertamamu!",
    promo_code_label: "Gunakan Kode:",

    // Popular & Flash Sale
    popular_title: "POPULER!",
    popular_desc: "Beberapa produk yang paling populer saat ini.",
    timer_days: "HARI",
    timer_hours: "JAM",
    timer_minutes: "MNT",
    timer_seconds: "DTK",
    stock_remaining: "TERSISA",

    // Categories & Articles
    category_empty: "Tidak ada game di kategori ini.",
    articles_title: "ARTIKEL TERBARU",
    articles_desc: "Dapatkan informasi terbaru seputar dunia game! Temukan panduan lengkap untuk meningkatkan pengalaman bermain, serta berita terkini mengenai promo, update top-up, dan komunitas gamer.",
    btn_all_articles: "Lihat Semua Artikel",

    // FAQ
    faq_title: "Sering Ditanyakan",
    faq_desc: "Punya pertanyaan? Kami punya jawabannya. Berikut adalah hal-hal yang sering ditanyakan oleh pengguna kami.",

    // Footer
    footer_desc: "Platform top up game terlengkap, cepat & termurah di Indonesia dengan layanan 24/7.",
    footer_payment_title: "Pembayaran Aman",
    footer_payment_more: "lainnya",
    footer_help_title: "Butuh Bantuan?",
    footer_wa_btn: "Chat WhatsApp",
    footer_hours_label: "Jam Operasional:",
    footer_guarantee_title: "Jaminan Transaksi",
    footer_guarantee_desc: "Garansi uang kembali 100% apabila layanan gagal terkirim karena kesalahan sistem.",
    footer_security_badge: "100% Legal & Aman",
    footer_social_title: "Sosial Media",
    footer_terms: "Syarat & Ketentuan",
    footer_privacy: "Kebijakan Privasi",
    footer_copyright: "All Rights Reserved.",
    footer_country_badge: "Indonesia / IDR",

    // Track Page
    track_title: "Lacak Pesanan",
    track_desc: "Pantau status transaksi top-up atau voucher Anda secara real-time. Masukkan nomor Invoice yang Anda dapatkan saat checkout.",
    track_placeholder: "Masukkan Invoice ID (Cth: NGS26...)",
    track_btn: "Lacak",
    track_not_found_title: "Pesanan Tidak Ditemukan",
    track_not_found_desc: "Pastikan Invoice ID yang dimasukkan sudah benar dan sesuai dengan struk pembelian Anda.",
    track_date_label: "TANGGAL PEMBELIAN",
    track_payment_status: "Status Pembayaran",
    track_process_status: "Status Proses",
    track_account_detail: "Detail Akun",
    track_payment_proof: "Bukti Pembayaran",
    track_total_price: "Total Harga",
    track_unpaid_notice: "Pesanan Anda belum dibayar. Selesaikan pembayaran untuk memproses pesanan.",
    track_pay_now_btn: "Lanjut ke Halaman Pembayaran",
    track_success_notice: "Transaksi berhasil! Terima kasih telah berbelanja di NewGamingStore.",
    track_full_invoice_btn: "Lihat Detail Invoice Penuh",

    // Prices Page
    prices_title: "Daftar Harga Layanan",
    prices_desc: "Temukan harga terbaik untuk semua game favorit Anda. Kami menawarkan berbagai level keanggotaan dengan diskon eksklusif yang menguntungkan.",
    prices_filter_game: "Filter Game",
    prices_filter_desc: "Pilih kategori game untuk menyaring tabel.",
    prices_search_sku: "Cari Layanan/SKU...",
    prices_cat_all: "Semua Kategori",
    prices_th_sku: "Kode / SKU",
    prices_th_service: "Nama Layanan",
    prices_th_guest: "Harga Tamu",
    prices_th_member: "Member",
    prices_th_platinum: "Platinum",
    prices_th_gold: "Gold",
    prices_th_status: "Status",
    prices_status_ready: "READY",
    prices_empty: "Tidak ada layanan yang sesuai dengan filter/pencarian Anda.",

    // Auth Pages (Login & Register)
    auth_banner_title: "NewGamingStore",
    auth_banner_desc: "NEWGAMINGSTORE | Platform Top Up Game & Voucher Terpercaya",
    auth_login_title: "Login Member",
    auth_login_subtitle: "Silakan masuk untuk melanjutkan.",
    auth_login_user_sub: "Masuk dengan username dan password Anda.",
    auth_reg_title: "Buat Akun",
    auth_reg_subtitle: "Daftar sekarang untuk memulai.",
    auth_wa_notice: "Pendaftaran akun hanya tersedia melalui Admin. Hubungi kami untuk mendaftar.",
    auth_wa_btn: "Hubungi Admin via WhatsApp",
    auth_label_name: "Nama Lengkap",
    auth_label_phone: "Nomor Telepon (WhatsApp)",
    auth_phone_err_format: "Nomor harus diawali 08, 62, atau +62",
    auth_phone_err_length: "Panjang nomor harus 10-15 digit",
    auth_label_username: "Username",
    auth_label_email: "Email",
    auth_label_password: "Password",
    auth_ph_password: "Masukkan password",
    auth_remember_me: "Ingat Saya",
    auth_forgot_pass: "Lupa Password?",
    auth_btn_processing: "MEMPROSES...",
    auth_btn_login: "MASUK SEKARANG",
    auth_btn_register: "DAFTAR SEKARANG",
    auth_no_account: "Belum punya akun?",
    auth_has_account: "Sudah punya akun?",
    auth_link_register: "Daftar sekarang",
    auth_link_login: "Masuk sekarang",

    // Game Detail Page (/game/[slug])
    game_fast_process: "Proses Cepat",
    game_chat_support: "Layanan Chat 24/7",
    game_official_product: "Produk Resmi",
    game_guide_btn: "Lihat Panduan Pengisian",
    game_guide_title: "Panduan Pengisian",
    game_price_label: "Harga",
    game_empty_products: "Belum ada produk top-up yang tersedia.",
    game_member_only: "Khusus Member",
    game_free_admin_fee: "Bebas Biaya Admin",
    game_empty_payments: "Belum ada metode pembayaran yang tersedia.",
    game_wa_placeholder: "628",
    game_wa_note: "*Contoh: 62821xxxxxxxxx (No WhatsApp wajib diisi)",
    game_wa_info: "Informasi: Bukti transaksi akan kami kirim ke WhatsApp atau email yang kamu isi di atas.",
    game_promo_btn_check: "Gunakan",
    game_promo_checking: "Cek...",
    game_promo_avail_btn: "Cek Promo Yang Tersedia",
    game_promo_modal_title: "Promo Tersedia",
    game_promo_modal_empty: "Tidak ada promo yang tersedia saat ini.",
    game_promo_select: "Pilih",
    game_bar_select_prompt: "Pilih Nominal & Pembayaran",
    game_sticky_instant: "**Waktu proses instan",
    game_sticky_checking: "Mengecek...",
    game_order_now: "Pesan Sekarang!",
    game_sticky_empty: "Silakan pilih nominal Top Up dan Pembayaran terlebih dahulu.",
    game_confirm_title: "Buat Pesanan",
    game_confirm_sub: "Pastikan data akun Anda dan produk yang Anda pilih valid dan sesuai.",
    game_confirm_player: "Data Player",
    game_confirm_summary: "Ringkasan Pembelian",
    game_confirm_btn: "Pesan Sekarang",
    game_confirm_cancel: "Batal",

    // Checkout Page (/checkout/[id])
    checkout_progress_title: "Progress Transaksi",
    checkout_step1_title: "Transaksi Dibuat",
    checkout_step1_desc: "Transaksi telah berhasil dibuat",
    checkout_step2_title: "Pembayaran",
    checkout_step2_desc: "Silakan melakukan pembayaran",
    checkout_step3_title: "Sedang Di Proses",
    checkout_step3_desc: "Pembelian sedang dalam proses.",
    checkout_step4_title: "Transaksi Selesai",
    checkout_step4_desc: "Transaksi telah berhasil dilakukan.",
    checkout_acc_info: "Informasi Akun",
    checkout_service_label: "Layanan :",
    checkout_details_title: "Rincian Pembayaran",
    checkout_price_item: "Harga",
    checkout_qty_item: "Jumlah",
    checkout_point_discount: "Potongan Point",
    checkout_voucher_discount: "Potongan Voucher",
    checkout_subtotal: "Subtotal",
    checkout_download_btn: "Unduh Invoice",
    checkout_method_title: "Metode Pembayaran",
    checkout_invoice_no: "Nomor Invoice",
    checkout_payment_status: "Status Pembayaran",
    checkout_trx_status: "Status Transaksi",
    checkout_voucher_note: "Kode Voucher / Catatan",
    checkout_promo_used: "Promo Digunakan",
    checkout_wait_payment: "Menunggu pembayaran",
    checkout_qris_scan: "SCAN UNTUK MEMBAYAR",
    checkout_qris_not_set: "QRIS Belum Diatur",
    checkout_qris_warn_title: "⚠️ Perhatian Khusus QRIS Static:",
    checkout_qris_warn_desc: "Saat memindai QRIS ini di aplikasi M-Banking/E-Wallet Anda, Anda WAJIB MENGETIK NOMINAL TAGIHAN SECARA MANUAL. Pastikan nominal transfer TEPAT:",
    checkout_qris_save_btn: "Simpan QRIS ke Galeri",
    checkout_wallet_title: "PEMBAYARAN SALDO AKUN",
    checkout_wallet_desc: "Tagihan akan dipotong dari Saldo Akun secara otomatis.",
    checkout_wallet_wait: "Mohon tunggu sistem memproses transaksi Anda.",
    checkout_bank_transfer: "Silakan transfer pembayaran ke rekening berikut:",
    checkout_confirm_title: "Konfirmasi Pembayaran",
    checkout_confirm_desc: "Silakan unggah bukti transfer Anda agar pesanan dapat segera kami proses.",
    checkout_change_img: "Ganti Gambar",
    checkout_click_upload: "Klik untuk upload bukti",
    checkout_uploading: "Mengunggah...",
    checkout_size_limit: "Maksimal ukuran foto 2MB (JPG, PNG, WEBP)",
    checkout_confirm_wa: "Konfirmasi via WhatsApp",
    checkout_tracking_btn: "Tracking Order",

    // User Profile Dropdown
    user_account_header: "AKUN ANDA",
    user_dashboard: "Dashboard Member",
    user_wallet_balance: "Saldo Akun",
    user_transactions: "Riwayat Transaksi",
    user_deposits: "Riwayat Deposit",
    user_upgrade: "Upgrade Membership",
    user_settings: "Pengaturan Profile",
    user_logout: "Keluar",
    user_logout_pending: "Keluar...",

    // Member Portal
    member_nav_dashboard: "Dashboard",
    member_nav_deposit: "Deposit",
    member_nav_transactions: "Riwayat Transaksi",
    member_nav_deposits: "Riwayat Deposit",
    member_nav_upgrade: "Upgrade Membership",
    member_upgrade_banner_t: "Tingkatkan Level Membership Anda",
    member_upgrade_banner_d: "Anda saat ini berada di Level",
    member_upgrade_btn: "Upgrade Membership",
    member_active_banner_t: "Membership Anda",
    member_active_banner_d: "Nikmati berbagai benefit khusus untuk level Anda.",
    member_active_btn: "Lihat Paket Lain",
    member_wa_channel_t: "Gabung Channel WhatsApp",
    member_wa_channel_d: "Dapatkan info promo, kode voucher, dan update terbaru langsung di WhatsApp.",
    member_wa_channel_btn: "Gabung Sekarang",
    member_card_id: "MEMBER ID",
    member_card_setting: "Atur Profil",
    member_since: "Member sejak:",
    member_wallet_title: "Dompet Anda",
    member_wallet_balance: "SALDO AKUN",
    member_stats_title: "Statistik Transaksi Hari Ini",
    member_stat_waiting: "MENUNGGU",
    member_stat_processed: "DALAM PROSES",
    member_stat_success: "SUKSES",
    member_stat_failed: "GAGAL",
    member_stat_total_trx: "Total Transaksi",
    member_stat_total_sale: "Total Penjualan",
    member_dep_title: "Deposit Saldo",
    member_dep_desc: "Isi saldo akun Anda untuk transaksi lebih cepat.",
    member_dep_current_bal: "SALDO SAAT INI",
    member_dep_step1: "Pilih Nominal Deposit",
    member_dep_custom_lbl: "Atau Masukkan Nominal Khusus (Min. Rp 10.000)",
    member_dep_custom_ph: "Contoh: 150000",
    member_dep_confirm_t: "Konfirmasi Deposit",
    member_dep_confirm_sub: "Pastikan data berikut sudah benar sebelum melanjutkan.",
    member_dep_submit_btn: "Proses Deposit",
    member_trx_filter_btn: "Filter Data",
    member_trx_reset_btn: "Reset",
    member_trx_th_inv: "NOMOR INVOICE",
    member_trx_th_item: "ITEM / GAME",
    member_trx_th_target: "TARGET",
    member_trx_th_total: "TOTAL BAYAR",
    member_trx_th_date: "TANGGAL",
    member_trx_th_status: "STATUS",
    member_trx_empty: "Tidak ada riwayat transaksi yang ditemukan.",
    member_upg_badge: "SUBSCRIPTION",
    member_upg_title: "Upgrade Membership",
    member_upg_role: "Current Role:",
    member_upg_sel_pkg: "PILIH PAKET",
    member_upg_submit_btn: "Proses Upgrade Sekarang",
  },
  ms: {
    // Header & Navigation
    nav_home: "Utama",
    nav_check_invoice: "Semak Pesanan",
    nav_price_list: "Senarai Harga",
    nav_blog: "Blog",
    search_placeholder: "Cari permainan kegemaran anda...",
    btn_login: "Log Masuk",
    btn_register: "Daftar",
    
    // Promo
    promo_subtitle: "Dapatkan diskaun istimewa untuk topup pertama anda!",
    promo_code_label: "Guna Kod:",

    // Popular & Flash Sale
    popular_title: "POPULAR!",
    popular_desc: "Beberapa produk yang paling popular ketika ini.",
    timer_days: "HARI",
    timer_hours: "JAM",
    timer_minutes: "MIN",
    timer_seconds: "SAAT",
    stock_remaining: "BAKI",

    // Categories & Articles
    category_empty: "Tiada permainan dalam kategori ini.",
    articles_title: "ARTIKEL TERKINI",
    articles_desc: "Dapatkan maklumat terkini seputar dunia permainan! Cari panduan lengkap untuk meningkatkan pengalaman bermain, serta berita terkini mengenai promosi, kemas kini topup, dan komuniti gamer.",
    btn_all_articles: "Lihat Semua Artikel",

    // FAQ
    faq_title: "Soalan Lazim",
    faq_desc: "Ada soalan? Kami ada jawapannya. Berikut adalah soalan yang kerap ditanya oleh pengguna kami.",

    // Footer
    footer_desc: "Platform topup permainan paling lengkap, pantas & termurah dengan perkhidmatan 24/7.",
    footer_payment_title: "Pembayaran Selamat",
    footer_payment_more: "lagi",
    footer_help_title: "Perlukan Bantuan?",
    footer_wa_btn: "Sembang WhatsApp",
    footer_hours_label: "Waktu Operasi:",
    footer_guarantee_title: "Jaminan Transaksi",
    footer_guarantee_desc: "Jaminan wang dikembalikan 100% jika perkhidmatan gagal dihantar akibat ralat sistem.",
    footer_security_badge: "100% Legal & Selamat",
    footer_social_title: "Media Sosial",
    footer_terms: "Terma & Syarat",
    footer_privacy: "Dasar Privasi",
    footer_copyright: "Hak Cipta Terpelihara.",
    footer_country_badge: "Malaysia / MYR",

    // Track Page
    track_title: "Semak Pesanan",
    track_desc: "Jejak status transaksi topup atau baucar anda secara masa nyata. Masukkan nombor Invois yang anda dapatkan semasa daftar keluar.",
    track_placeholder: "Masukkan ID Invois (Cth: NGS26...)",
    track_btn: "Cari",
    track_not_found_title: "Pesanan Tidak Ditemui",
    track_not_found_desc: "Pastikan ID Invois yang dimasukkan adalah betul dan padan dengan resit pembelian anda.",
    track_date_label: "TARIKH PEMBELIAN",
    track_payment_status: "Status Pembayaran",
    track_process_status: "Status Proses",
    track_account_detail: "Maklumat Akaun",
    track_payment_proof: "Bukti Pembayaran",
    track_total_price: "Jumlah Harga",
    track_unpaid_notice: "Pesanan anda belum dibayar. Selesaikan pembayaran untuk memproses pesanan.",
    track_pay_now_btn: "Teruskan ke Halaman Pembayaran",
    track_success_notice: "Transaksi berjaya! Terima kasih kerana membeli-belah bersama kami.",
    track_full_invoice_btn: "Lihat Maklumat Invois Penuh",

    // Prices Page
    prices_title: "Senarai Harga Perkhidmatan",
    prices_desc: "Cari harga terbaik untuk semua permainan kegemaran anda. Kami menawarkan pelbagai tahap keahlian dengan diskaun eksklusif.",
    prices_filter_game: "Penapis Permainan",
    prices_filter_desc: "Pilih kategori permainan untuk menapis jadual.",
    prices_search_sku: "Cari Perkhidmatan/SKU...",
    prices_cat_all: "Semua Kategori",
    prices_th_sku: "Kod / SKU",
    prices_th_service: "Nama Perkhidmatan",
    prices_th_guest: "Harga Tetamu",
    prices_th_member: "Ahli",
    prices_th_platinum: "Platinum",
    prices_th_gold: "Emas",
    prices_th_status: "Status",
    prices_status_ready: "SEDIA",
    prices_empty: "Tiada perkhidmatan yang padan dengan penapis/carian anda.",

    // Auth Pages (Login & Register)
    auth_banner_title: "NewGamingStore",
    auth_banner_desc: "NEWGAMINGSTORE | Platform Topup Permainan & Baucar Dipercayai",
    auth_login_title: "Log Masuk Ahli",
    auth_login_subtitle: "Sila log masuk untuk meneruskan.",
    auth_login_user_sub: "Log masuk dengan nama pengguna dan kata laluan anda.",
    auth_reg_title: "Daftar Akaun",
    auth_reg_subtitle: "Daftar sekarang untuk bermula.",
    auth_wa_notice: "Pendaftaran akaun hanya boleh dilakukan melalui Admin. Hubungi kami untuk mendaftar.",
    auth_wa_btn: "Hubungi Admin melalui WhatsApp",
    auth_label_name: "Nama Penuh",
    auth_label_phone: "Nombor Telefon (WhatsApp)",
    auth_phone_err_format: "Nombor mesti bermula dengan 08, 62, atau +62",
    auth_phone_err_length: "Panjang nombor mestilah 10-15 digit",
    auth_label_username: "Nama Pengguna",
    auth_label_email: "E-mel",
    auth_label_password: "Kata Laluan",
    auth_ph_password: "Masukkan kata laluan",
    auth_remember_me: "Ingat Saya",
    auth_forgot_pass: "Lupa Kata Laluan?",
    auth_btn_processing: "MEMPROSES...",
    auth_btn_login: "LOG MASUK SEKARANG",
    auth_btn_register: "DAFTAR SEKARANG",
    auth_no_account: "Belum ada akaun?",
    auth_has_account: "Sudah ada akaun?",
    auth_link_register: "Daftar sekarang",
    auth_link_login: "Log masuk sekarang",

    // Game Detail Page (/game/[slug])
    game_fast_process: "Proses Pantas",
    game_chat_support: "Perkhidmatan Sembang 24/7",
    game_official_product: "Produk Rasmi",
    game_guide_btn: "Lihat Panduan Pengisian",
    game_guide_title: "Panduan Pengisian",
    game_price_label: "Harga",
    game_empty_products: "Belum ada produk topup yang tersedia.",
    game_member_only: "Khusus Ahli",
    game_free_admin_fee: "Bebas Yuran Admin",
    game_empty_payments: "Belum ada kaedah pembayaran yang tersedia.",
    game_wa_placeholder: "601",
    game_wa_note: "*Contoh: 60123xxxxxxx (No. WhatsApp wajib diisi)",
    game_wa_info: "Maklumat: Bukti transaksi akan dihantar ke WhatsApp atau e-mel yang anda isi di atas.",
    game_promo_btn_check: "Guna",
    game_promo_checking: "Semak...",
    game_promo_avail_btn: "Semak Promo Yang Ada",
    game_promo_modal_title: "Promo Yang Ada",
    game_promo_modal_empty: "Tiada promo yang ada ketika ini.",
    game_promo_select: "Pilih",
    game_bar_select_prompt: "Pilih Nilai & Pembayaran",
    game_sticky_instant: "**Masa proses serta-merta",
    game_sticky_checking: "Semakan...",
    game_order_now: "Pesan Sekarang!",
    game_sticky_empty: "Sila pilih nilai Topup dan Pembayaran terlebih dahulu.",
    game_confirm_title: "Buat Pesanan",
    game_confirm_sub: "Pastikan maklumat akaun anda dan produk yang anda pilih adalah sah dan betul.",
    game_confirm_player: "Maklumat Pemain",
    game_confirm_summary: "Ringkasan Pembelian",
    game_confirm_btn: "Pesan Sekarang",
    game_confirm_cancel: "Batal",

    // Checkout Page (/checkout/[id])
    checkout_progress_title: "Kemajuan Transaksi",
    checkout_step1_title: "Transaksi Dicipta",
    checkout_step1_desc: "Transaksi telah berjaya dicipta",
    checkout_step2_title: "Pembayaran",
    checkout_step2_desc: "Sila buat pembayaran",
    checkout_step3_title: "Dalam Proses",
    checkout_step3_desc: "Pembelian sedang dalam proses.",
    checkout_step4_title: "Transaksi Selesai",
    checkout_step4_desc: "Transaksi telah berjaya dilakukan.",
    checkout_acc_info: "Maklumat Akaun",
    checkout_service_label: "Perkhidmatan :",
    checkout_details_title: "Butiran Pembayaran",
    checkout_price_item: "Harga",
    checkout_qty_item: "Kuantiti",
    checkout_point_discount: "Potongan Mata",
    checkout_voucher_discount: "Potongan Baucar",
    checkout_subtotal: "Jumlah Keseluruhan",
    checkout_download_btn: "Muat Turun Invois",
    checkout_method_title: "Kaedah Pembayaran",
    checkout_invoice_no: "Nombor Invois",
    checkout_payment_status: "Status Pembayaran",
    checkout_trx_status: "Status Transaksi",
    checkout_voucher_note: "Kod Baucar / Catatan",
    checkout_promo_used: "Promo Digunakan",
    checkout_wait_payment: "Menunggu pembayaran",
    checkout_qris_scan: "IMBAS UNTUK MEMBAYAR",
    checkout_qris_not_set: "QRIS Belum Diatur",
    checkout_qris_warn_title: "⚠️ Perhatian Khusus QRIS Statik:",
    checkout_qris_warn_desc: "Semasa mengimbas QRIS ini dalam aplikasi M-Banking/E-Wallet anda, anda WAJIB MENAIP JUMLAH TAGIHAN SECARA MANUAL. Pastikan jumlah pindahan TEPAT:",
    checkout_qris_save_btn: "Simpan QRIS ke Galeri",
    checkout_wallet_title: "PEMBAYARAN BAKI AKAUN",
    checkout_wallet_desc: "Tagihan akan ditolak daripada Baki Akaun secara automatik.",
    checkout_wallet_wait: "Sila tunggu sistem memproses transaksi anda.",
    checkout_bank_transfer: "Sila pindah pembayaran ke akaun berikut:",
    checkout_confirm_title: "Pengesahan Pembayaran",
    checkout_confirm_desc: "Sila muat naik bukti pindahan anda supaya pesanan boleh diproses segera.",
    checkout_change_img: "Tukar Gambar",
    checkout_click_upload: "Klik untuk muat naik bukti",
    checkout_uploading: "Memuat naik...",
    checkout_size_limit: "Saiz foto maksimum 2MB (JPG, PNG, WEBP)",
    checkout_confirm_wa: "Pengesahan melalui WhatsApp",
    checkout_tracking_btn: "Jejak Pesanan",

    // User Profile Dropdown
    user_account_header: "AKAUN ANDA",
    user_dashboard: "Papan Pemuka Ahli",
    user_wallet_balance: "Baki Akaun",
    user_transactions: "Sejarah Transaksi",
    user_deposits: "Sejarah Deposit",
    user_upgrade: "Tingkat Keahlian",
    user_settings: "Tetapan Profil",
    user_logout: "Log Keluar",
    user_logout_pending: "Log Keluar...",

    // Member Portal
    member_nav_dashboard: "Papan Pemuka",
    member_nav_deposit: "Deposit",
    member_nav_transactions: "Sejarah Transaksi",
    member_nav_deposits: "Sejarah Deposit",
    member_nav_upgrade: "Tingkat Keahlian",
    member_upgrade_banner_t: "Tingkatkan Tahap Keahlian Anda",
    member_upgrade_banner_d: "Anda kini berada di Tahap",
    member_upgrade_btn: "Tingkat Keahlian",
    member_active_banner_t: "Keahlian Anda",
    member_active_banner_d: "Nikmati pelbagai faedah khas untuk tahap anda.",
    member_active_btn: "Lihat Pakej Lain",
    member_wa_channel_t: "Sertai Saluran WhatsApp",
    member_wa_channel_d: "Dapatkan info promosi, kod baucar, dan kemas kini terkini terus di WhatsApp.",
    member_wa_channel_btn: "Sertai Sekarang",
    member_card_id: "ID AHLI",
    member_card_setting: "Tetapkan Profil",
    member_since: "Ahli sejak:",
    member_wallet_title: "Dompet Anda",
    member_wallet_balance: "BAKI AKAUN",
    member_stats_title: "Statistik Transaksi Hari Ini",
    member_stat_waiting: "MENUNGGU",
    member_stat_processed: "DALAM PROSES",
    member_stat_success: "BERJAYA",
    member_stat_failed: "GAGAL",
    member_stat_total_trx: "Jumlah Transaksi",
    member_stat_total_sale: "Jumlah Pembelian",
    member_dep_title: "Deposit Baki",
    member_dep_desc: "Isi baki akaun anda untuk transaksi lebih pantas.",
    member_dep_current_bal: "BAKI KINI",
    member_dep_step1: "Pilih Nilai Deposit",
    member_dep_custom_lbl: "Atau Masukkan Nilai Khas (Min. Rp 10.000)",
    member_dep_custom_ph: "Contoh: 150000",
    member_dep_confirm_t: "Pengesahan Deposit",
    member_dep_confirm_sub: "Pastikan maklumat berikut adalah betul sebelum meneruskan.",
    member_dep_submit_btn: "Proses Deposit",
    member_trx_filter_btn: "Tapis Data",
    member_trx_reset_btn: "Set Semula",
    member_trx_th_inv: "NOMBOR INVOIS",
    member_trx_th_item: "ITEM / PERMAINAN",
    member_trx_th_target: "SASARAN",
    member_trx_th_total: "JUMLAH BAYAR",
    member_trx_th_date: "TARIKH",
    member_trx_th_status: "STATUS",
    member_trx_empty: "Tiada sejarah transaksi ditemui.",
    member_upg_badge: "LANGGANAN",
    member_upg_title: "Tingkat Keahlian",
    member_upg_role: "Peranan Semasa:",
    member_upg_sel_pkg: "PILIH PAKEJ",
    member_upg_submit_btn: "Proses Tingkat Sekarang",
  },
};

export function getDictionary(lang: Language = "id") {
  return dictionaries[lang] || dictionaries.id;
}
```

---

## 4. Alur Pengaturan di Backoffice Admin (`/admin/theme`)

1. Memperbarui `ThemeConfig` pada `src/lib/themeUtils.ts`:
   ```typescript
   export interface ThemeConfig {
     themePreset?: ThemePreset;
     language?: Language; // "id" | "ms"
     colors?: Partial<ThemeColors>;
     // ...
   }
   ```
2. Memperbarui `src/app/admin/(authenticated)/theme/ThemeClient.tsx`:
   - Menambahkan Seksi **"Bahasa Storefront"**.
   - Menyediakan komponen kartu pilihan:
     - 🇮🇩 **Bahasa Indonesia (`id`)**
     - 🇲🇾 **Bahasa Melayu / Malaysia (`ms`)**
   - Menyimpan pilihan `language` ke database via server action yang sudah ada.

---

## 5. Refaktorisasi Komponen Storefront & Member Portal

1. **`src/components/storefront/Footer.tsx`**:
   - Membaca `language` dari `themeConfig`.
   - Mengubah indikator negara & bendera secara fleksibel:
     - Jika `id`: Menampilkan Bendera Merah Putih + `Indonesia / IDR`.
     - Jika `ms`: Menampilkan Bendera Jalur Gemilang (Malaysia) + `Malaysia / MYR`.

2. **`src/components/storefront/Header.tsx` & `UserDropdown.tsx`**:
   - Menggunakan kamus bahasa terpusat.

3. **`src/components/storefront/MemberSidebar.tsx`**:
   - Menggunakan kamus bahasa terpusat untuk navigasi sidebar.

4. **Halaman Portal Member (`/member/dashboard`, `/member/deposit`, `/member/transactions`, `/member/upgrade`)**:
   - Membaca `language` dari `themeConfig`.
   - Menggunakan terjemahan lengkap sesuai tabel pemetaan.

---

## 6. Rencana Verifikasi
- **Automated**: Menjalankan `npx tsc --noEmit` untuk memastikan tidak ada kesalahan tipe TypeScript.
- **Manual Check**:
  1. Ganti bahasa ke `ms` di `/admin/theme`.
  2. Buka `localhost:3000`, `/track`, `/prices`, `/login`, `/game/valorant-9a145`, `/checkout/NGS260815763005`, dan halaman member `/member/dashboard`, `/member/deposit`, `/member/transactions`, `/member/upgrade`.
  3. Pastikan seluruh teks di halaman member portal berbahasa Melayu.
  4. Cek area Footer: Pastikan bendera dan teks berubah menjadi **Malaysia / MYR**.
