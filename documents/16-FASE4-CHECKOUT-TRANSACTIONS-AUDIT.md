# 16 - FASE 4: INTEGRITAS TRANSAKSI, CHECKOUT & PROTOKOL AUDIT MULTI-CURRENCY

Dokumen ini menjelaskan rancangan teknis dan implementasi **Fase 4**: Penguncian mata uang pada proses Checkout & Transaksi, validasi kanal pembayaran anti-fraud, isolasi saldo dompet, serta protokol pengujian menyeluruh (*End-to-End Testing*).

---

## 1. Alur Pembuatan Pesanan & Validasi Anti-Fraud (`checkoutActions.ts`)

Saat pengunjung menekan tombol **Beli Sekarang** di Storefront:

### A. Validasi Integritas Harga di Server Action
Sistem tidak boleh mempercayai harga yang dikirim dari browser client. Server Action wajib menghitung ulang harga produk berdasarkan data database dan mata uang aktif:

```typescript
// Di dalam createOrderAction:
const { data: product } = await supabase
  .from('products')
  .select('id, price, prices, active, is_flash_sale, original_price, original_prices')
  .eq('id', productId)
  .eq('tenant_id', tenantId)
  .single();

// 1. Ambil harga valid sesuai mata uang pesanan
const finalPrice = getProductPrice(product, currency);

// 2. Validasi Payment Channel
const { data: channel } = await supabase
  .from('payment_channels')
  .select('id, supported_currencies, is_active')
  .eq('id', paymentChannelId)
  .single();

if (!channel.supported_currencies.includes(currency)) {
  throw new Error(`Metode pembayaran ini tidak berlaku untuk transaksi mata uang ${currency}`);
}

// 3. Kunci order dengan mata uang dan nominal yang tepat
const { data: order } = await supabase
  .from('orders')
  .insert([{
    tenant_id: tenantId,
    game_id: gameId,
    product_id: productId,
    customer_email: customerEmail,
    total_price: finalPrice,
    currency: currency, // 'IDR' | 'MYR' | 'SGD'
    status: 'Pending',
    form_data: formData,
  }])
  .select()
  .single();
```

---

## 2. Halaman Invoice & Pelacakan Pesanan (`/checkout/[id]` & `/track`)

Halaman tanda terima pembayaran dan invoice transaksi membaca nilai mata uang yang terkunci di database pesanan, bukan dari cookie saat ini:

```tsx
// Di dalam CheckoutClient.tsx:
const orderCurrency = (order.currency as Currency) || 'IDR';

<div className="flex justify-between items-center py-2 border-b border-border">
  <span className="text-muted-foreground text-sm">Total Pembayaran:</span>
  <span className="text-2xl font-black text-theme-primary">
    {formatCurrency(order.total_price, orderCurrency)}
  </span>
</div>
```

---

## 3. Alur Deposit Saldo & Pembayaran Dompet Multi-Currency

### A. Alur Deposit (`/member/deposit`):
1. Member memilih nominal sesuai mata uang aktif (contoh SGD: `[5, 10, 20, 50, 100]`).
2. Tabel `deposits` mencatat `amount` dan `currency` (`currency = 'SGD'`).
3. Setelah diverifikasi oleh BO Operator / Gateway, saldo masuk ke dompet member.

### B. Pembayaran Menggunakan Saldo (Wallet):
- Jika order bernilai `S$ 1.80`, sistem memverifikasi bahwa saldo dompet pengguna mencukupi dalam satuan nominal yang setara.

---

## 4. Matriks Validasi Keamanan (Security Audit Matrix)

| Skenario Pengujian Serangan | Resiko Keamanan | Mitigasi / Penanganan |
| :--- | :--- | :--- |
| **Manipulasi Currency Client** | User mengubah payload request menjadi `currency = 'IDR'` untuk membayar Rp 1.80 pada barang seharga S$ 1.80 | Server Action mencocokkan `channel.supported_currencies` dan menghitung ulang harga via `getProductPrice(product, currency)`. |
| **Kanal Pembayaran Silang** | User checkout barang `SGD` menggunakan QRIS Rupiah | Sistem menolak jika `payment_channel.supported_currencies` tidak memuat `SGD`. |
| **Fluktuasi Kurs Masa Depan** | Nilai kurs berubah mempengaruhi laporan keuangan lama | Tabel `orders` dan `deposits` menyimpan `currency` dan `total_price` statis saat checkout. |

---

## 5. Protokol Pengujian Komprehensif (End-to-End Testing)

### Skenario 1: Transaksi Indonesia (IDR)
1. Buka Storefront dengan mode `IDR`.
2. Pastikan harga tertulis `Rp 20.000`.
3. Checkout menggunakan QRIS / BCA.
4. Pastikan invoice mencatat `Rp 20.000` dengan currency `IDR`.

### Skenario 2: Transaksi Malaysia (MYR)
1. Ganti mata uang di Navbar ke `MYR`.
2. Pastikan harga tertulis `RM 5.50`.
3. Checkout menggunakan DuitNow QR.
4. Pastikan invoice mencatat `RM 5.50` dengan currency `MYR`.

### Skenario 3: Transaksi Singapore (SGD)
1. Ganti mata uang di Navbar ke `SGD`.
2. Pastikan harga tertulis `S$ 1.80`.
3. Checkout menggunakan PayNow QR / DBS.
4. Pastikan invoice mencatat `S$ 1.80` dengan currency `SGD`.
5. Klik tombol WhatsApp CS dan pastikan terhubung ke nomor (+65).

---

## 6. Kesimpulan & Status Kesiapan Rilis

Dengan selesainya arsitektur pada Fase 1 hingga Fase 4, platform memiliki sistem **Multi-Currency & Multi-Region Enterprise** yang aman, fleksibel, bebas *hydration mismatch*, dan siap menangani ekspansi pasar lintas Asia Tenggara (Indonesia, Malaysia, dan Singapura).
