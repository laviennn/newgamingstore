"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveAdminTenantId } from "@/app/admin/actions";

export async function saveProduct(formData: FormData, id?: string) {
  const game_id = formData.get("game_id") as string;
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const active = formData.get("active") === "true";
  const image_url = formData.get("image_url") as string;
  
  const is_flash_sale = formData.get("is_flash_sale") === "true";
  const original_price_raw = formData.get("original_price") as string;
  const flash_sale_stock_raw = formData.get("flash_sale_stock") as string;
  const variant_type_raw = formData.get("variant_type") as string;
  const variant_type = variant_type_raw === "" ? null : variant_type_raw;

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
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    if (id) {
      const { error } = await supabase
        .from("products")
        .update({ game_id, name, price: numericPrice, active, image_url, is_flash_sale, original_price, flash_sale_stock, variant_type })
        .eq("id", id)
        .eq("tenant_id", tenant_id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("products")
        .insert([{ tenant_id, game_id, name, price: numericPrice, active, image_url, is_flash_sale, original_price, flash_sale_stock, variant_type }]);
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
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase.from("products").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to delete product." };
  }
}

export async function duplicateProduct(id: string) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
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

export async function toggleProductStatus(id: string, active: boolean) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase
      .from("products")
      .update({ active })
      .eq("id", id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to update product status." };
  }
}
