import { z } from "zod";

/**
 * Zod Schema untuk transaksi Deposit
 */
export const DepositSchema = z.object({
  paymentMethodId: z.string().min(1, "Metode pembayaran wajib dipilih"),
  waNumber: z
    .string()
    .min(8, "Nomor WhatsApp minimal 8 karakter")
    .max(20, "Nomor WhatsApp maksimal 20 karakter")
    .regex(/^[0-9+]+$/, "Format nomor WhatsApp tidak valid"),
  amount: z
    .number({ invalid_type_error: "Nominal harus berupa angka" })
    .positive("Nominal deposit harus bernilai positif")
    .min(10000, "Minimal deposit adalah Rp 10.000"),
  customerEmail: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  tenantId: z.string().optional(),
});

export type DepositInput = z.infer<typeof DepositSchema>;

/**
 * Zod Schema untuk Tambah / Edit Produk
 */
export const UpdateProductSchema = z.object({
  id: z.string().optional(),
  game_id: z.string().min(1, "Game ID wajib dipilih"),
  name: z
    .string()
    .min(2, "Nama produk minimal 2 karakter")
    .max(100, "Nama produk maksimal 100 karakter"),
  price: z
    .number({ invalid_type_error: "Harga harus berupa angka" })
    .positive("Harga harus berupa angka positif"),
  active: z.boolean().default(true),
  image_url: z
    .string()
    .url("URL Gambar tidak valid")
    .or(z.string().length(0))
    .optional(),
  is_flash_sale: z.boolean().default(false),
  original_price: z
    .number()
    .positive("Harga asli harus angka positif")
    .nullable()
    .optional(),
  flash_sale_stock: z
    .number()
    .int()
    .nonnegative("Stok flash sale tidak boleh negatif")
    .optional()
    .default(0),
  variant_type: z
    .string()
    .max(50, "Tipe varian maksimal 50 karakter")
    .nullable()
    .optional(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
