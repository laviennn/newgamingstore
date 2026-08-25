import { Language } from "./dictionary";

export type Currency = "IDR" | "MYR" | "SGD" | "PHP" | "INR" | "USD";

export interface CurrencyConfig {
  code: Currency;
  label: string;
  fullName: string;
  symbol: string;
  flag: string;
  locale: string;
  decimals: number;
}

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  SGD: { code: "SGD", label: "SGD (S$)", fullName: "Singapore Dollar (SGD)", symbol: "S$", flag: "🇸🇬", locale: "en-SG", decimals: 2 },
  IDR: { code: "IDR", label: "IDR (Rp)", fullName: "Indonesia Rupiah (IDR)", symbol: "Rp", flag: "🇮🇩", locale: "id-ID", decimals: 0 },
  MYR: { code: "MYR", label: "MYR (RM)", fullName: "Malaysia Ringgit (MYR)", symbol: "RM", flag: "🇲🇾", locale: "ms-MY", decimals: 2 },
  INR: { code: "INR", label: "INR (₹)", fullName: "India Rupee (INR)", symbol: "₹", flag: "🇮🇳", locale: "en-IN", decimals: 2 },
  PHP: { code: "PHP", label: "PHP (₱)", fullName: "Philippines Pesos (PHP)", symbol: "₱", flag: "🇵🇭", locale: "en-PH", decimals: 2 },
  USD: { code: "USD", label: "USD ($)", fullName: "US Dollar (USD)", symbol: "$", flag: "🇺🇸", locale: "en-US", decimals: 2 },
};

/**
 * Mendapatkan Currency default berdasarkan Language
 */
export function getCurrencyFromLanguage(lang: Language = "id"): Currency {
  if (lang === "ms") return "MYR";
  if (lang === "en") return "SGD";
  return "IDR";
}

/**
 * Mendapatkan Bahasa / Language default berdasarkan Currency yang aktif
 */
export function getLanguageFromCurrency(currency: Currency = "IDR"): Language {
  if (currency === "MYR") return "ms";
  if (currency === "SGD" || currency === "USD" || currency === "PHP" || currency === "INR") return "en";
  return "id";
}

export interface PhoneConfig {
  flag: string;
  dialCode: string;
  countryName: string;
  placeholder: string;
  pattern: string;
  helperText: string;
  example: string;
}

/**
 * Mendapatkan konfigurasi format dan placeholder nomor telepon/WhatsApp
 * berdasarkan mata uang/region yang dipilih oleh visitor.
 */
export function getPhoneConfigForCurrency(
  currency: Currency = "IDR",
  lang: Language = "id"
): PhoneConfig {
  switch (currency) {
    case "MYR":
      return {
        flag: "🇲🇾",
        dialCode: "+60",
        countryName: "Malaysia",
        placeholder: lang === "ms" ? "Contoh: 0123456789 atau 60123456789" : "Example: 0123456789 or 60123456789",
        pattern: "^(\\+?60|60|01)\\d{7,11}$",
        helperText: lang === "ms" 
          ? "Nombor WhatsApp Malaysia aktif (+60 / 01...) untuk menerima invois transaksi." 
          : "Active Malaysia WhatsApp number (+60 / 01...) to receive transaction invoice.",
        example: "60123456789",
      };
    case "SGD":
      return {
        flag: "🇸🇬",
        dialCode: "+65",
        countryName: "Singapore",
        placeholder: "Example: 81234567 or +6581234567",
        pattern: "^(\\+?65)?[89]\\d{7}$",
        helperText: "Active Singapore WhatsApp / Mobile number (+65...) to receive transaction invoice.",
        example: "+6581234567",
      };
    case "PHP":
      return {
        flag: "🇵🇭",
        dialCode: "+63",
        countryName: "Philippines",
        placeholder: "Example: 09123456789 or 639123456789",
        pattern: "^(\\+?63|09)\\d{9,10}$",
        helperText: "Active Philippines mobile / WhatsApp number (+63...) to receive transaction invoice.",
        example: "639123456789",
      };
    case "USD":
      return {
        flag: "🇺🇸",
        dialCode: "+1",
        countryName: "United States",
        placeholder: "Example: +1 2345678900",
        pattern: "^(\\+?1)?[2-9]\\d{9}$",
        helperText: "Active US mobile number (+1...) to receive transaction invoice.",
        example: "+12345678900",
      };
    case "IDR":
    default:
      return {
        flag: "🇮🇩",
        dialCode: "+62",
        countryName: "Indonesia",
        placeholder: "Contoh: 081234567890 atau 6281234567890",
        pattern: "^(08|62|\\+62)\\d{8,13}$",
        helperText: "Nomor WhatsApp Indonesia aktif (+62 / 08...) untuk menerima struk/invoice transaksi.",
        example: "081234567890",
      };
  }
}

/**
 * Format angka ke format mata uang yang tepat (IDR vs MYR vs SGD)
 * @param amount Nilai nominal angka
 * @param currency Mata uang ("IDR" | "MYR" | "SGD")
 * @param options Opsi kustomisasi format
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: Currency = "IDR",
  options?: {
    showSymbol?: boolean;
    spaceAfterSymbol?: boolean;
  }
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

export interface MultiCurrencyProduct {
  name?: string;
  names?: Record<string, string> | null;
  price?: number;
  prices?: Record<string, number> | null;
  original_price?: number | null;
  original_prices?: Record<string, number> | null;
}

/**
 * Memeriksa apakah produk tersedia dan memiliki harga valid (> 0) di mata uang tertentu.
 * Memungkinkan tiap negara memiliki daftar item produk yang berbeda (misal ID 10 item, MY 12 item).
 */
export function isProductAvailableInCurrency(
  product: MultiCurrencyProduct | null | undefined,
  currency: Currency = "IDR"
): boolean {
  if (!product) return false;

  // 1. Cek dari object `prices` jika tersedia
  if (product.prices && typeof product.prices === "object") {
    const val = product.prices[currency];
    if (val !== undefined && val !== null && !isNaN(Number(val)) && Number(val) > 0) {
      return true;
    }
    // Jika object prices terisi untuk currency lain tapi tidak untuk currency ini, maka TIDAK tersedia
    const hasAnyExplicitPrice = Object.values(product.prices).some(
      (v) => v !== undefined && v !== null && !isNaN(Number(v)) && Number(v) > 0
    );
    if (hasAnyExplicitPrice) {
      return false;
    }
  }

  // 2. Fallback untuk data legacy yang hanya punya kolom `price` tunggal (dianggap sebagai IDR)
  if (currency === "IDR" && Number(product.price) > 0) {
    return true;
  }

  return false;
}

/**
 * Mendapatkan daftar mata uang yang aktif/tersedia untuk produk ini
 */
export function getAvailableProductCurrencies(
  product: MultiCurrencyProduct | null | undefined
): Currency[] {
  if (!product) return [];
  const available: Currency[] = [];

  const allCurrencies: Currency[] = ["IDR", "MYR", "SGD", "PHP", "INR", "USD"];
  for (const cur of allCurrencies) {
    if (isProductAvailableInCurrency(product, cur)) {
      available.push(cur);
    }
  }

  return available;
}

/**
 * Mendapatkan nama produk berdasarkan mata uang / wilayah aktif
 * Jika nama khusus untuk mata uang tidak ditemukan di objek `names`, fallback ke `name` dasar
 */
export function getProductName(
  product: { name?: string; names?: Record<string, string> | null } | null | undefined,
  currency: Currency = "IDR"
): string {
  if (!product) return "";
  if (product.names && typeof product.names === "object") {
    const customName = product.names[currency];
    if (customName && typeof customName === "string" && customName.trim() !== "") {
      return customName.trim();
    }
  }
  return product.name || "";
}

/**
 * Mendapatkan harga nominal produk berdasarkan mata uang aktif
 * Jika mata uang memiliki harga valid di `prices`, kembalikan nilainya.
 * Jika tidak tersedia untuk mata uang tersebut, kembalikan 0 (bukan fallback ke angka IDR).
 */
export function getProductPrice(
  product: MultiCurrencyProduct | null | undefined,
  currency: Currency = "IDR"
): number {
  if (!product) return 0;
  if (product.prices && typeof product.prices === "object") {
    const customPrice = product.prices[currency];
    if (customPrice !== undefined && customPrice !== null && !isNaN(Number(customPrice)) && Number(customPrice) > 0) {
      return Number(customPrice);
    }
    // Jika ada harga di currency lain tapi tidak di currency ini
    const hasAnyExplicitPrice = Object.values(product.prices).some(
      (v) => v !== undefined && v !== null && !isNaN(Number(v)) && Number(v) > 0
    );
    if (hasAnyExplicitPrice) {
      return 0;
    }
  }

  // Fallback hanya untuk legacy IDR
  if (currency === "IDR" && Number(product.price) > 0) {
    return Number(product.price);
  }

  return 0;
}

/**
 * Mendapatkan harga coret (original_price) produk berdasarkan mata uang aktif
 */
export function getProductOriginalPrice(
  product: MultiCurrencyProduct | null | undefined,
  currency: Currency = "IDR"
): number | null {
  if (!product) return null;
  if (product.original_prices && typeof product.original_prices === "object") {
    const customOriginalPrice = product.original_prices[currency];
    if (
      customOriginalPrice !== undefined &&
      customOriginalPrice !== null &&
      !isNaN(Number(customOriginalPrice)) &&
      Number(customOriginalPrice) > 0
    ) {
      return Number(customOriginalPrice);
    }
  }

  // Fallback hanya untuk legacy IDR
  if (currency === "IDR" && product.original_price && Number(product.original_price) > 0) {
    return Number(product.original_price);
  }

  return null;
}

/**
 * Pilihan Preset Nominal Deposit yang disesuaikan dengan skala mata uang
 */
export function getDepositNominalOptions(currency: Currency = "IDR"): number[] {
  if (currency === "SGD") {
    return [5, 10, 20, 50, 100, 200, 500];
  }
  if (currency === "MYR") {
    return [5, 10, 20, 50, 100, 200, 500, 1000];
  }
  return [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];
}

/**
 * Nilai Minimal Deposit sesuai mata uang
 */
export function getMinDepositAmount(currency: Currency = "IDR"): number {
  if (currency === "SGD") return 5;
  if (currency === "MYR") return 5;
  return 10000;
}
