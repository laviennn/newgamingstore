"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveProduct(formData: FormData, id?: string) {
  const game_id = formData.get("game_id") as string;
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const active = formData.get("active") === "true";
  const image_url = formData.get("image_url") as string;
  
  const is_flash_sale = formData.get("is_flash_sale") === "true";
  const original_price_raw = formData.get("original_price") as string;
  const flash_sale_stock_raw = formData.get("flash_sale_stock") as string;

  if (!game_id || !name || !price) {
    return { error: "Game, Name, and Price are required." };
  }

  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return { error: "Price must be a valid positive number." };
  }

  const original_price = is_flash_sale && original_price_raw ? parseFloat(original_price_raw) : null;
  const flash_sale_stock = is_flash_sale && flash_sale_stock_raw ? parseInt(flash_sale_stock_raw, 10) : 0;

  const supabase = await createClient();

  try {
    if (id) {
      const { error } = await supabase
        .from("products")
        .update({ game_id, name, price: numericPrice, active, image_url, is_flash_sale, original_price, flash_sale_stock })
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("products")
        .insert([{ game_id, name, price: numericPrice, active, image_url, is_flash_sale, original_price, flash_sale_stock }]);
      if (error) throw error;
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to save product." };
  }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to delete product." };
  }
}

export async function duplicateProduct(id: string) {
  const supabase = await createClient();
  try {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !product) {
      throw new Error("Product not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, created_at: __, ...productWithoutId } = product;
    productWithoutId.name = `${productWithoutId.name} (Copy)`;

    const { error: insertError } = await supabase
      .from("products")
      .insert([productWithoutId]);

    if (insertError) throw insertError;

    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to duplicate product." };
  }
}
