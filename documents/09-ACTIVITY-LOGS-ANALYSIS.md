# 09 - Analisis & Arsitektur Fitur Activity Log Admin

## 1. Latar Belakang & Tujuan
Fitur **Activity Log (Log Aktivitas Operator)** dirancang untuk mencatat seluruh riwayat tindakan operasional, manipulasi data katalog, transaksi keuangan, serta perubahan pengaturan yang dilakukan oleh Admin / Operator Backoffice.

Tujuan utama:
1. **Audit Trail & Keamanan:** Mengetahui *siapa* (`admin_email`, `admin_role`), *kapan* (`created_at`), *dari mana* (`ip_address`, `user_agent`), dan *apa* yang diubah.
2. **Pelacakan Payload / Diffs:** Menyimpan nilai data mentah (`payload` dalam format `JSONB`) yang mencakup kondisi sebelum (*previous state*) dan sesudah (*new state*) per field.
3. **Akuntabilitas Multi-Operator:** Mempermudah SuperAdmin/Owner dalam memantau kinerja tim dan melacak kesalahan input data/perubahan harga katalog secara presisi.

---

## 2. Struktur Skema Database (`public.activity_logs`)

```sql
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text NOT NULL,
  admin_role text,
  action text NOT NULL,       -- 'CREATE', 'UPDATE', 'DELETE', 'DUPLICATE', 'APPROVE', 'REJECT', 'TOGGLE_STATUS', 'REORDER'
  entity text NOT NULL,       -- 'game', 'category', 'product', 'order', 'payment_channel', 'contact_settings'
  entity_id text,             -- ID atau Invoice ID terkait
  description text NOT NULL,  -- Ringkasan manusiawi (misal: "Memperbarui harga produk Mobile Legends 86 Diamonds")
  payload jsonb DEFAULT '{}'::jsonb, -- Data terstruktur, diffs, snapshot
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indeks performa untuk query cepat & filter
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_id ON public.activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_email ON public.activity_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
```

---

## 3. Analisis 6 Modul Admin & Spesifikasi Nilai Payload

Berikut adalah analisis terperinci untuk ke-6 modul yang diminta:

### Modul 1: Katalog Game (`/admin/games`)
| Action | Trigger | Deskripsi | Spesifikasi Nilai `payload` |
| :--- | :--- | :--- | :--- |
| **`CREATE`** | Operator menambah game baru | Menambahkan game baru ke katalog | Snapshot data lengkap game (`name`, `slug`, `developer`, `category_id`, `form_fields`, `is_popular`, `validator_provider`, `validator_game_code`, `image_url`, `topup_instructions`). |
| **`UPDATE`** | Operator mengedit game | Mengubah detail/instruksi/validator game | Menyimpan objek `{ previous, updated, diffs: [{ field, from, to }] }` untuk melacak field mana saja yang diubah (misal: developer, category, gambar, petunjuk topup). |
| **`DELETE`** | Operator menghapus game | Menghapus game dari katalog | Snapshot game yang dihapus `{ id, name, slug, developer, total_products_affected }`. |
| **`TOGGLE_STATUS`** | Switch populer | Mengubah status game populer | `{ is_popular: true/false, game_name }`. |
| **`REORDER`** | Drag & drop urutan | Mengubah susunan urutan game di storefront | `{ ordered_ids: string[], count: number }`. |

### Modul 2: Kategori Layanan (`/admin/categories`)
| Action | Trigger | Deskripsi | Spesifikasi Nilai `payload` |
| :--- | :--- | :--- | :--- |
| **`CREATE`** | Tambah kategori | Menambahkan kategori baru | Snapshot `{ name, slug, icon_name, sort_order, is_active }`. |
| **`UPDATE`** | Edit kategori | Mengubah nama/slug/icon kategori | `{ previous, updated, diffs: [{ field, from, to }] }`. |
| **`DELETE`** | Hapus kategori | Menghapus kategori | Snapshot `{ id, name, slug }`. |
| **`TOGGLE_STATUS`** | Toggle aktif | Mengaktifkan/nonaktifkan kategori | `{ is_active: boolean, category_name }`. |

### Modul 3: Produk & Harga (`/admin/products`)
| Action | Trigger | Deskripsi | Spesifikasi Nilai `payload` |
| :--- | :--- | :--- | :--- |
| **`CREATE`** | Tambah produk | Menambahkan item denom baru | Snapshot lengkap `{ game_id, game_name, name, price, variant_type, is_flash_sale, original_price, flash_sale_stock, active }`. |
| **`UPDATE`** | Edit produk | Mengubah nominal harga/promo | `{ previous, updated, diffs: [{ field, from, to }] }` — *Sangat krusial untuk melacak siapa yang mengubah harga jual!* |
| **`DELETE`** | Hapus produk | Menghapus produk dari game | Snapshot produk yang dihapus `{ id, name, price, game_id, game_name }`. |
| **`DUPLICATE`** | Gandakan produk | Duplikasi produk yang sudah ada | `{ source_product_id, new_product_name, cloned_attributes }`. |
| **`TOGGLE_STATUS`** | Toggle aktif produk | Mengaktifkan/menonaktifkan produk | `{ active: boolean, product_name, price }`. |

### Modul 4: Pesanan & Transaksi (`/admin/orders`)
| Action | Trigger | Deskripsi | Spesifikasi Nilai `payload` |
| :--- | :--- | :--- | :--- |
| **`APPROVE` / `UPDATE_STATUS`** | Update status pesanan / pembayaran | Mengubah status order (misal: Unpaid ➔ PAID, Pending ➔ Success) | `{ invoice_id, previous_status, new_status, previous_payment_status, new_payment_status, total_price, customer_email, game_name, product_name }`. |
| **`DELETE`** | Hapus pesanan | Menghapus record order dari daftar | Snapshot order yang dihapus `{ invoice_id, total_price, status, payment_status, customer_email }`. |

### Modul 5: Saluran Pembayaran (`/admin/payments`)
| Action | Trigger | Deskripsi | Spesifikasi Nilai `payload` |
| :--- | :--- | :--- | :--- |
| **`CREATE`** | Tambah channel bayar | Menambahkan rekening/metode bayar baru | Snapshot `{ category, name, account_number, account_name, is_active, qr_image_url }`. |
| **`UPDATE`** | Edit channel bayar | Mengubah no. rekening / atas nama / QRIS | `{ previous, updated, diffs: [{ field, from, to }] }` — *Krusial mencegah pengalihan rekening diam-diam!* |
| **`DELETE` / `DEACTIVATE`** | Hapus / Nonaktifkan channel | Menghapus/menonaktifkan metode | `{ id, name, account_number, account_name, action_type: 'hard_delete' \| 'soft_deactivated' }`. |
| **`TOGGLE_STATUS`** | Toggle aktif payment | Mengaktifkan/mematikan channel | `{ is_active: boolean, payment_name }`. |

### Modul 6: Kontak & Micro Field Branding (`/admin/contacts`)
| Action | Trigger | Deskripsi | Spesifikasi Nilai `payload` |
| :--- | :--- | :--- | :--- |
| **`UPDATE`** | Simpan perubahan kontak & branding | Mengubah no. WA, banner footer, floating widget, jam operasional | Menyimpan perbandingan perubahan micro-fields: <br>• `whatsapp`: `{ from, to }`<br>• `footerBannerUrl`: `{ from, to }`<br>• `waFloatingAvatarUrl`: `{ from, to }`<br>• `waFloatingText`: `{ from, to }`<br>• `waDefaultMessage`: `{ from, to }`<br>• `waChannelUrl`: `{ from, to }`<br>• `social_media`: `{ instagram, tiktok, youtube, email }`<br>• `operationalHours`: `{ from, to }`. |

---

## 4. Rancang Bangun RBAC & Hak Akses
1. **Penambahan Permission:**  
   Menambahkan `manage_activity_logs` ke dalam kategori `"Pengaturan Sistem"` pada daftar `AVAILABLE_PERMISSIONS` di `RolesClient.tsx`.
2. **Evaluasi Hak Akses:**
   - **SuperAdmin:** Memiliki akses penuh ke seluruh log semua tenant atau tenant aktif.
   - **Owner / Role dengan `manage_activity_logs`:** Dapat melihat seluruh log aktivitas operator pada tenant mereka.
   - **Operator tanpa permission:** Mendapatkan status `UnauthorizedAccess`.

---

## 5. Rancang Bangun Antarmuka (UI/UX) Halaman `/admin/activity-logs`
1. **Statistik Aktivitas Cepat:**  
   Total Aktivitas Hari Ini, Total Perubahan Katalog, Total Aksi Transaksi, Operator Paling Aktif.
2. **Filter Dinamis & Pencarian Real-Time:**
   - Pencarian berdasarkan Email Operator, Invoice ID, Nama Game/Produk, atau Deskripsi.
   - Filter dropdown berdasarkan **Modul (Entity)** dan **Tipe Aksi (Action)**.
3. **Tabel Log Interaktif & Kolom:**
   - **Waktu**: Tanggal & jam lokal lengkap dengan indikator relatif (misal: "5 menit yang lalu").
   - **Operator**: Badge avatar, email admin, dan nama role (`Owner`, `Staff Operasional`, `SuperAdmin`).
   - **Aksi & Modul**: Pill badge berwarna kontras (`CREATE` hijau, `UPDATE` biru, `DELETE` merah, `APPROVE` emerald, `DUPLICATE` ungu).
   - **Deskripsi**: Ringkasan aksi yang jelas dan mudah dipahami.
   - **IP & User Agent**: Badge IP Address client dan ikon perangkat/browser.
   - **Tombol Detail / Inspect Payload**: Membuka modal inspeksi dengan tampilan JSON yang rapi, *copy to clipboard*, dan visual Diffs (*Before ➔ After*).
