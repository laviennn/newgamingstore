import { Language } from "./dictionary";

export type Currency = "IDR" | "MYR";

/**
 * Mendapatkan Currency default berdasarkan Language
 */
export function getCurrencyFromLanguage(lang: Language = "id"): Currency {
  return lang === "ms" ? "MYR" : "IDR";
}

/**
 * Format angka ke format mata uang yang tepat (IDR vs MYR)
 * @param amount Nilai nominal angka
 * @param currency Mata uang ("IDR" | "MYR")
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
  const showSymbol = options?.showSymbol ?? true;
  const space = options?.spaceAfterSymbol ?? true ? " " : "";

  if (currency === "MYR") {
    const formatted = numericAmount.toLocaleString("ms-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return showSymbol ? `RM${space}${formatted}` : formatted;
  }

  // Default: IDR
  const formatted = Math.round(numericAmount).toLocaleString("id-ID");
  return showSymbol ? `Rp${space}${formatted}` : formatted;
}

/**
 * Pilihan Preset Nominal Deposit yang disesuaikan dengan skala mata uang
 */
export function getDepositNominalOptions(currency: Currency = "IDR"): number[] {
  if (currency === "MYR") {
    return [5, 10, 20, 50, 100, 200, 500, 1000];
  }
  return [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];
}

/**
 * Nilai Minimal Deposit sesuai mata uang
 */
export function getMinDepositAmount(currency: Currency = "IDR"): number {
  return currency === "MYR" ? 5 : 10000;
}
