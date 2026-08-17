import { Language } from "@/lib/dictionary";

export interface OrderWAMessageParams {
  template?: string | null;
  language?: Language;
  invoiceId: string;
  productName: string;
  totalPriceFormatted: string;
  paymentProofUrl: string;
  storeName?: string;
  paymentMethodName?: string;
}

export interface DepositWAMessageParams {
  template?: string | null;
  language?: Language;
  isUpgrade?: boolean;
  packageName?: string;
  invoiceId: string;
  amountFormatted: string;
  paymentProofUrl: string;
  storeName?: string;
  paymentMethodName?: string;
}

/**
 * Builds the WhatsApp confirmation message for Game Order Checkouts.
 * - If a custom template is defined by BO Operator in theme_config, replaces placeholders.
 * - Otherwise, automatically uses the localized default message for Malaysia (ms) or Indonesia (id).
 */
export function buildOrderWAMessage(params: OrderWAMessageParams): string {
  const {
    template,
    language = "id",
    invoiceId,
    productName,
    totalPriceFormatted,
    paymentProofUrl,
    storeName = "Store",
    paymentMethodName = "",
  } = params;

  // 1. If BO custom template is configured, replace placeholders
  if (template && template.trim()) {
    return template
      .replace(/\{invoice_id\}|\{no_invoice\}/gi, invoiceId)
      .replace(/\{product_name\}|\{item_name\}|\{pesanan\}/gi, productName)
      .replace(/\{total\}|\{total_price\}|\{total_biaya\}|\{nominal\}/gi, totalPriceFormatted)
      .replace(/\{payment_proof\}|\{bukti_transfer\}|\{bukti_pembayaran\}|\{bukti_pindahan\}/gi, paymentProofUrl)
      .replace(/\{store_name\}|\{nama_toko\}/gi, storeName)
      .replace(/\{payment_method\}|\{metode_pembayaran\}|\{kaedah_pembayaran\}/gi, paymentMethodName);
  }

  // 2. Multi-language default fallback
  if (language === "ms") {
    return `Helo Admin, saya ingin membuat pengesahan pembayaran:
- No. Invois: *${invoiceId}*
- Pesanan: *${productName}*
- Jumlah: *${totalPriceFormatted}*
- Bukti Pindahan: ${paymentProofUrl}

Sila proses pesanan ini secepat mungkin ya, terima kasih!`;
  }

  // Default: Indonesia (id)
  return `Halo Admin, saya ingin konfirmasi pembayaran:
- No. Invoice: *${invoiceId}*
- Pesanan: *${productName}*
- Total: *${totalPriceFormatted}*
- Bukti Transfer: ${paymentProofUrl}

Mohon segera diproses ya, terima kasih!`;
}

/**
 * Builds the WhatsApp confirmation message for Deposit & Upgrade Checkouts.
 * - If a custom template is defined by BO Operator in theme_config, replaces placeholders.
 * - Otherwise, automatically uses the localized default message for Malaysia (ms) or Indonesia (id).
 */
export function buildDepositWAMessage(params: DepositWAMessageParams): string {
  const {
    template,
    language = "id",
    isUpgrade = false,
    packageName = "Upgrade Membership",
    invoiceId,
    amountFormatted,
    paymentProofUrl,
    storeName = "Store",
    paymentMethodName = "",
  } = params;

  // 1. If BO custom template is configured, replace placeholders
  if (template && template.trim()) {
    const itemOrPackage = isUpgrade ? packageName : (language === "ms" ? "Deposit Baki" : "Deposit Saldo");
    return template
      .replace(/\{invoice_id\}|\{no_invoice\}/gi, invoiceId)
      .replace(/\{product_name\}|\{package_name\}|\{item_name\}|\{pesanan\}/gi, itemOrPackage)
      .replace(/\{total\}|\{total_price\}|\{total_biaya\}|\{amount\}|\{nominal\}/gi, amountFormatted)
      .replace(/\{payment_proof\}|\{bukti_transfer\}|\{bukti_pembayaran\}|\{bukti_pindahan\}/gi, paymentProofUrl)
      .replace(/\{store_name\}|\{nama_toko\}/gi, storeName)
      .replace(/\{payment_method\}|\{metode_pembayaran\}|\{kaedah_pembayaran\}/gi, paymentMethodName);
  }

  // 2. Multi-language default fallback
  if (language === "ms") {
    if (isUpgrade) {
      return `Helo Admin, saya ingin membuat pengesahan peningkatan keahlian (${packageName}):
- No. Invois: *${invoiceId}*
- Jumlah Yuran: *${amountFormatted}*
- Bukti Pindahan: ${paymentProofUrl}

Sila proses peningkatan ini secepat mungkin ya, terima kasih!`;
    }
    return `Helo Admin, saya ingin membuat pengesahan deposit baki:
- No. Invois: *${invoiceId}*
- Nilai Deposit: *${amountFormatted}*
- Bukti Pindahan: ${paymentProofUrl}

Sila proses deposit ini secepat mungkin ya, terima kasih!`;
  }

  // Default: Indonesia (id)
  if (isUpgrade) {
    return `Halo Admin, saya ingin konfirmasi upgrade membership (${packageName}):
- No. Invoice: *${invoiceId}*
- Total Biaya: *${amountFormatted}*
- Bukti Transfer: ${paymentProofUrl}

Mohon segera diproses ya, terima kasih!`;
  }

  return `Halo Admin, saya ingin konfirmasi deposit saldo:
- No. Invoice: *${invoiceId}*
- Nominal Deposit: *${amountFormatted}*
- Bukti Transfer: ${paymentProofUrl}

Mohon segera diproses ya, terima kasih!`;
}
