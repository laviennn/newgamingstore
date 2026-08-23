# 14 - FASE 2: IMPLEMENTASI STOREFRONT MULTI-CURRENCY & MULTI-REGION (VISITOR EXPERIENCE)

Dokumen ini menjelaskan rancangan teknis dan implementasi **Fase 2**: Integrasi pemilih mata uang di Navbar (*Currency Selector*), pemformatan mata uang `SGD`, filter katalog game adaptif per wilayah, harga produk dinamis, dan perutean kontak CS WhatsApp berbasis region.

---

## 1. Pembaruan Utilitas Mata Uang Terpadu (`src/lib/currencyUtils.ts`)

Mata uang yang didukung diperluas menjadi **`IDR`**, **`MYR`**, dan **`SGD`**:

```typescript
import { Language } from "./dictionary";

export type Currency = "IDR" | "MYR" | "SGD";

export interface CurrencyConfig {
  code: Currency;
  label: string;
  symbol: string;
  flag: string;
  locale: string;
  decimals: number;
}

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  IDR: { code: "IDR", label: "IDR (Rp)", symbol: "Rp", flag: "🇮🇩", locale: "id-ID", decimals: 0 },
  MYR: { code: "MYR", label: "MYR (RM)", symbol: "RM", flag: "🇲🇾", locale: "ms-MY", decimals: 2 },
  SGD: { code: "SGD", label: "SGD (S$)", symbol: "S$", flag: "🇸🇬", locale: "en-SG", decimals: 2 },
};

/**
 * Format angka ke format mata uang yang tepat (IDR vs MYR vs SGD)
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: Currency = "IDR",
  options?: { showSymbol?: boolean; spaceAfterSymbol?: boolean }
): string {
  const numericAmount = Number(amount) || 0;
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.IDR;
  const showSymbol = options?.showSymbol ?? true;
  const space = options?.spaceAfterSymbol ?? true ? (currency === "IDR" ? " " : "") : "";

  const formatted = numericAmount.toLocaleString(config.locale, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  return showSymbol ? `${config.symbol}${space}${formatted}` : formatted;
}

/**
 * Preset Nominal Deposit Sesuai Mata Uang
 */
export function getDepositNominalOptions(currency: Currency = "IDR"): number[] {
  if (currency === "SGD") return [5, 10, 20, 50, 100, 200, 500];
  if (currency === "MYR") return [5, 10, 20, 50, 100, 200, 500, 1000];
  return [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];
}

export function getMinDepositAmount(currency: Currency = "IDR"): number {
  if (currency === "SGD") return 5;
  if (currency === "MYR") return 5;
  return 10000;
}
```

---

## 2. Komponen Navbar Currency Switcher (`src/components/storefront/CurrencySelector.tsx`)

Komponen pemilih mata uang yang interaktif untuk Navbar Desktop dan Mobile Drawer:

```tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Currency, CURRENCY_CONFIGS } from "@/lib/currencyUtils";
import { ChevronDown, Check } from "lucide-react";

interface CurrencySelectorProps {
  currentCurrency: Currency;
  supportedCurrencies: Currency[];
}

export function CurrencySelector({ currentCurrency, supportedCurrencies }: CurrencySelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Jika tenant hanya mendukung 1 mata uang, jangan tampilkan switcher
  if (!supportedCurrencies || supportedCurrencies.length <= 1) return null;

  const handleSelect = (code: Currency) => {
    // 1. Simpan ke Cookie dengan masa aktif 30 hari
    document.cookie = `storefront_currency=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    setIsOpen(false);
    
    // 2. Refresh halaman untuk memperbarui seluruh SSR data
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all text-white"
      >
        <span className="text-sm">{CURRENCY_CONFIGS[currentCurrency]?.flag}</span>
        <span>{CURRENCY_CONFIGS[currentCurrency]?.code}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-popover border border-border rounded-xl shadow-xl z-50 p-1 space-y-0.5">
          {supportedCurrencies.map((code) => {
            const isSelected = currentCurrency === code;
            const config = CURRENCY_CONFIGS[code];
            return (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected ? "bg-primary/20 text-primary" : "hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{config.flag}</span>
                  <span>{config.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

## 3. Resolusi Mata Uang Aktif di Server Component (`src/app/[domain]/layout.tsx`)

Resolusi hirarki mata uang di *Server Side Rendering*:

```typescript
// 1. Baca cookie pilihan pengunjung
const cookieStore = await cookies();
const userCurrencyCookie = cookieStore.get('storefront_currency')?.value as Currency | undefined;

// 2. Baca konfigurasi tenant
const isMultiCurrency = !!tenantData?.theme_config?.multi_currency_enabled;
const supportedCurrencies: Currency[] = tenantData?.theme_config?.supported_currencies || 
  (tenantData?.theme_config?.currency ? [tenantData.theme_config.currency] : ['IDR']);
const defaultCurrency: Currency = tenantData?.theme_config?.default_currency || supportedCurrencies[0] || 'IDR';

// 3. Tentukan mata uang aktif
let activeCurrency: Currency = defaultCurrency;
if (isMultiCurrency && userCurrencyCookie && supportedCurrencies.includes(userCurrencyCookie)) {
  activeCurrency = userCurrencyCookie;
}
```

---

## 4. Filter Katalog Game & Harga Produk Berdasarkan Mata Uang

### A. Filter Game Dinamis di Beranda & Daftar Game:
```typescript
// Hanya tampilkan game yang mendukung activeCurrency
const visibleGames = allGames.filter((g) => {
  if (!g.supported_currencies || g.supported_currencies.length === 0) return true;
  return g.supported_currencies.includes(activeCurrency);
});
```

### B. Tampilan Harga Produk Dinamis di Detail Game (`StorefrontGameForm.tsx`):
```tsx
import { getProductPrice, getProductOriginalPrice, formatCurrency } from "@/lib/currencyUtils";

// Di dalam komponen render item produk:
const itemPrice = getProductPrice(product, currency);
const itemOriginalPrice = getProductOriginalPrice(product, currency);

<span className="font-bold text-foreground">
  {formatCurrency(itemPrice, currency)}
</span>
{product.is_flash_sale && itemOriginalPrice && (
  <span className="text-xs text-muted-foreground line-through ml-1.5">
    {formatCurrency(itemOriginalPrice, currency)}
  </span>
)}
```

---

## 5. Perutean Kontak CS WhatsApp Dinamis (`FloatingWhatsapp.tsx`)

Mengarahkan pesan WhatsApp pengunjung ke nomor CS lokal yang tepat sesuai negara:

```typescript
// Ambil nomor WA sesuai mata uang/region aktif
export function getWhatsappForCurrency(themeConfig: any, currency: Currency = 'IDR'): string {
  if (themeConfig?.whatsapp_contacts && themeConfig.whatsapp_contacts[currency]) {
    return themeConfig.whatsapp_contacts[currency];
  }
  return themeConfig?.whatsappNumber || themeConfig?.whatsapp || "";
}
```

---

## 6. Checklist Verifikasi & Pengujian Fase 2

- [ ] Dropdown currency muncul di Navbar ketika `multi_currency_enabled: true`.
- [ ] Dropdown currency **tidak muncul** jika tenant hanya mengaktifkan 1 mata uang.
- [ ] Mengubah mata uang ke `SGD` otomatis memformat seluruh harga menjadi `S$ X.XX`.
- [ ] Game yang tidak diaktifkan untuk `SGD` otomatis tersembunyi dari katalog beranda dan daftar harga.
- [ ] Tombol WhatsApp mengarahkan ke nomor CS Singapura (+65) saat berada di mode `SGD`.
