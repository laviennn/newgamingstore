# 15 - FASE 3: MANAJEMEN MULTI-CURRENCY PADA PANEL ADMIN BO OPERATOR

Dokumen ini berisi spesifikasi teknis dan panduan implementasi **Fase 3**: Antarmuka Backoffice (Admin Dashboard) untuk mengelola pengaturan Multi-Currency tenant, input harga produk multi-mata uang, checklist ketersediaan wilayah game, manajemen kanal pembayaran, dan pencatatan audit log aktivitas operator.

---

## 1. Pengaturan Multi-Currency & CS Kontak pada Menu Tenant Settings

Pada halaman pengaturan tema/tenant (`/admin/theme` atau `/admin/tenants`), BO Operator dapat mengatur:

### A. Komponen UI Pengaturan Mata Uang:
1. **Toggle Switch**: `Aktifkan Fitur Multi-Mata Uang (Multi-Currency)`
2. **Checkbox Wilayah yang Didukung**:
   - `[✓] 🇮🇩 IDR - Rupiah Indonesia (Rp)`
   - `[✓] 🇲🇾 MYR - Ringgit Malaysia (RM)`
   - `[✓] 🇸🇬 SGD - Dolar Singapura (S$)`
3. **Mata Uang Default**: Dropdown untuk menentukan mata uang bawaan saat pengunjung pertama kali membuka website.

### B. Komponen Form Kontak WhatsApp per Wilayah:
```tsx
<div className="space-y-3 p-4 bg-muted/30 rounded-xl border">
  <h3 className="text-sm font-bold flex items-center gap-2">
    <MessageSquare className="h-4 w-4 text-emerald-500" />
    Nomor WhatsApp Customer Service per Wilayah
  </h3>
  
  {/* Input WA Indonesia */}
  {supportedCurrencies.includes('IDR') && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
      <label className="text-xs font-semibold">🇮🇩 Indonesia (+62):</label>
      <Input 
        placeholder="Contoh: 6281234567890" 
        value={themeConfig.whatsapp_contacts?.IDR || ''} 
        onChange={(e) => handleWAChange('IDR', e.target.value)} 
        className="md:col-span-2"
      />
    </div>
  )}

  {/* Input WA Malaysia */}
  {supportedCurrencies.includes('MYR') && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
      <label className="text-xs font-semibold">🇲🇾 Malaysia (+60):</label>
      <Input 
        placeholder="Contoh: 601234567890" 
        value={themeConfig.whatsapp_contacts?.MYR || ''} 
        onChange={(e) => handleWAChange('MYR', e.target.value)} 
        className="md:col-span-2"
      />
    </div>
  )}

  {/* Input WA Singapore */}
  {supportedCurrencies.includes('SGD') && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
      <label className="text-xs font-semibold">🇸🇬 Singapore (+65):</label>
      <Input 
        placeholder="Contoh: 6591234567" 
        value={themeConfig.whatsapp_contacts?.SGD || ''} 
        onChange={(e) => handleWAChange('SGD', e.target.value)} 
        className="md:col-span-2"
      />
    </div>
  )}
</div>
```

---

## 2. Form Input Produk Multi-Harga (`ProductFormModal.tsx`)

Ketika tenant mengaktifkan lebih dari satu mata uang, modal tambah/edit produk secara dinamis menampilkan tab/kelompok input harga untuk masing-masing mata uang aktif:

```tsx
<div className="space-y-4">
  <Label className="text-sm font-bold">Harga Produk per Mata Uang</Label>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {/* Input IDR */}
    {tenantCurrencies.includes('IDR') && (
      <div className="p-3 bg-muted/40 rounded-lg border space-y-2">
        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
          🇮🇩 Harga IDR (Rp)
        </span>
        <Input
          type="number"
          placeholder="Rp 20.000"
          value={formState.prices.IDR || ''}
          onChange={(e) => handlePriceChange('IDR', Number(e.target.value))}
        />
        {formState.is_flash_sale && (
          <Input
            type="number"
            placeholder="Coret: Rp 22.000"
            value={formState.original_prices.IDR || ''}
            onChange={(e) => handleOriginalPriceChange('IDR', Number(e.target.value))}
          />
        )}
      </div>
    )}

    {/* Input MYR */}
    {tenantCurrencies.includes('MYR') && (
      <div className="p-3 bg-muted/40 rounded-lg border space-y-2">
        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
          🇲🇾 Harga MYR (RM)
        </span>
        <Input
          type="number"
          step="0.01"
          placeholder="RM 5.50"
          value={formState.prices.MYR || ''}
          onChange={(e) => handlePriceChange('MYR', Number(e.target.value))}
        />
        {formState.is_flash_sale && (
          <Input
            type="number"
            step="0.01"
            placeholder="Coret: RM 6.00"
            value={formState.original_prices.MYR || ''}
            onChange={(e) => handleOriginalPriceChange('MYR', Number(e.target.value))}
          />
        )}
      </div>
    )}

    {/* Input SGD */}
    {tenantCurrencies.includes('SGD') && (
      <div className="p-3 bg-muted/40 rounded-lg border space-y-2">
        <span className="text-xs font-bold text-blue-500 flex items-center gap-1">
          🇸🇬 Harga SGD (S$)
        </span>
        <Input
          type="number"
          step="0.01"
          placeholder="S$ 1.80"
          value={formState.prices.SGD || ''}
          onChange={(e) => handlePriceChange('SGD', Number(e.target.value))}
        />
        {formState.is_flash_sale && (
          <Input
            type="number"
            step="0.01"
            placeholder="Coret: S$ 2.00"
            value={formState.original_prices.SGD || ''}
            onChange={(e) => handleOriginalPriceChange('SGD', Number(e.target.value))}
          />
        )}
      </div>
    )}
  </div>
</div>
```

---

## 3. Checklist Ketersediaan Wilayah Game (`GameFormModal.tsx`)

BO Operator dapat menentukan di negara mana saja game tersebut akan tampil:

```tsx
<div className="space-y-2">
  <Label className="text-sm font-bold">Ketersediaan Wilayah Game</Label>
  <p className="text-xs text-muted-foreground">
    Pilih negara/mata uang tempat game ini dapat dibeli oleh pengunjung:
  </p>
  <div className="flex items-center gap-4 pt-1">
    {['IDR', 'MYR', 'SGD'].map((cur) => (
      <label key={cur} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
        <input
          type="checkbox"
          checked={formState.supported_currencies.includes(cur)}
          onChange={(e) => handleToggleGameCurrency(cur, e.target.checked)}
          className="rounded border-input text-primary focus:ring-primary h-4 w-4"
        />
        <span>{cur === 'IDR' ? '🇮🇩 Indonesia (IDR)' : cur === 'MYR' ? '🇲🇾 Malaysia (MYR)' : '🇸🇬 Singapore (SGD)'}</span>
      </label>
    ))}
  </div>
</div>
```

---

## 4. Manajemen Kanal Pembayaran per Mata Uang (`/admin/payments`)

Form tambah/edit kanal pembayaran menyertakan pilihan mata uang:
- **Radio / Checklist Mata Uang**:
  - `IDR Saja` (Contoh: BCA, Mandiri, BRI, QRIS Indonesia)
  - `MYR Saja` (Contoh: DuitNow QR, Touch 'n Go eWallet, FPX)
  - `SGD Saja` (Contoh: PayNow QR, GrabPay Singapore, DBS PayLah)
  - `Semua Mata Uang` (Contoh: Saldo Akun / Wallet)

---

## 5. Audit Log Aktivitas Multi-Currency (`activity-logger.ts`)

Perbarui fungsi `calculateDiffs` agar mencatat perubahan harga per mata uang secara transparan:
```typescript
// Contoh log yang dihasilkan:
"Memperbarui harga produk '86 Diamonds': [IDR: Rp 20.000 -> Rp 21.000], [SGD: S$ 1.80 -> S$ 1.90]"
```

---

## 6. Checklist Verifikasi & Pengujian Fase 3

- [ ] Operator dapat mengaktifkan/menonaktifkan mata uang di menu Settings.
- [ ] Modal produk menampilkan form input nominal sesuai mata uang aktif tenant.
- [ ] Data harga tersimpan dengan benar ke kolom JSONB `prices` dan `original_prices`.
- [ ] Operator dapat mengatur visibilitas game per negara melalui checkbox wilayah.
- [ ] Kanal pembayaran dapat dikelompokkan berdasarkan target mata uangnya.
