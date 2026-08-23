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
  price: number;
  prices?: Record<string, number> | null;
  original_price?: number | null;
  original_prices?: Record<string, number> | null;
}

/**
 * Mendapatkan nama produk berdasarkan mata uang / wilayah aktif
 * Jika mata uang tidak ditemukan di objek `names`, fallback ke `name` dasar
 */
export function getProductName(product: { name?: string; names?: Record<string, string> | null } | null | undefined, currency: Currency = "IDR"): string {
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
 * Jika mata uang tidak ditemukan di objek `prices`, fallback ke `price` dasar
 */
export function getProductPrice(product: MultiCurrencyProduct | null | undefined, currency: Currency = "IDR"): number {
  if (!product) return 0;
  if (product.prices && typeof product.prices === "object") {
    const customPrice = product.prices[currency];
    if (customPrice !== undefined && customPrice !== null && !isNaN(Number(customPrice))) {
      return Number(customPrice);
    }
  }
  return Number(product.price) || 0;
}

/**
 * Mendapatkan harga coret (original_price) produk berdasarkan mata uang aktif
 */
export function getProductOriginalPrice(product: MultiCurrencyProduct | null | undefined, currency: Currency = "IDR"): number | null {
  if (!product) return null;
  if (product.original_prices && typeof product.original_prices === "object") {
    const customOriginalPrice = product.original_prices[currency];
    if (customOriginalPrice !== undefined && customOriginalPrice !== null && !isNaN(Number(customOriginalPrice))) {
      return Number(customOriginalPrice);
    }
  }
  return product.original_price ? Number(product.original_price) : null;
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
