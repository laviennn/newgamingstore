"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { createSafeAction } from "@/lib/safe-action";
import { UpdateProductSchema } from "@/schemas/transaction.schema";
import { logActivity, calculateDiffs } from "@/lib/activity-logger";

export const saveProductAction = createSafeAction(
  UpdateProductSchema,
  async (data, { tenantId, supabase }) => {
    const {
      id,
      game_id,
      name,
      names,
      price,
      prices,
      active,
      image_url,
      is_flash_sale,
      original_price,
      original_prices,
      flash_sale_stock,
      variant_type,
    } = data;

    const productPayload = {
      game_id,
      name,
      names: names || {},
      price,
      prices: prices || {},
      active,
      image_url: image_url || "",
      is_flash_sale,
      original_price: is_flash_sale ? original_price : null,
      original_prices: is_flash_sale ? (original_prices || {}) : {},
      flash_sale_stock: is_flash_sale ? flash_sale_stock : 0,
      variant_type: variant_type || null,
    };

    if (id) {
      const { data: previousProd } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .maybeSingle();

      const { error } = await supabase
        .from("products")
        .update(productPayload)
        .eq("id", id)
        .eq("tenant_id", tenantId);

      if (error) throw error;

      const diffResult = calculateDiffs(previousProd, productPayload);
      await logActivity({
        action: "UPDATE",
        entity: "product",
        entityId: id,
        tenantId,
        description: `Memperbarui produk "${name}" (${diffResult.diffs.length} perubahan)`,
        payload: {
          product_id: id,
          product_name: name,
          game_id,
          previous: diffResult.previous,
          updated: diffResult.updated,
          diffs: diffResult.diffs,
        },
      });
    } else {
      const { data: newProd, error } = await supabase
        .from("products")
        .insert([{ tenant_id: tenantId, ...productPayload }])
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: "CREATE",
        entity: "product",
        entityId: newProd?.id,
        tenantId,
        description: `Menambahkan produk baru "${name}" (Harga: ${price})`,
        payload: {
          product_id: newProd?.id,
          ...productPayload,
        },
      });
    }

    revalidatePath("/admin/products");
    revalidateStorefront();
    return { success: true };
  },
  { requireAuth: true, requiredPermission: "manage_products" }
);

export async function saveProduct(formData: FormData, id?: string) {
  const game_id = formData.get("game_id") as string;
  const name = formData.get("name") as string;
  const priceRaw = formData.get("price") as string;
  const active = formData.get("active") === "true";
  const image_url = (formData.get("image_url") as string) || "";
  const is_flash_sale = formData.get("is_flash_sale") === "true";
  const original_price_raw = formData.get("original_price") as string;
  const flash_sale_stock_raw = formData.get("flash_sale_stock") as string;
  const variant_type_raw = formData.get("variant_type") as string;

  const names_raw = formData.get("names") as string;
  let names = {};
  if (names_raw) {
    try {
      names = JSON.parse(names_raw);
    } catch {
      names = {};
    }
  }

  const prices_raw = formData.get("prices") as string;
  let prices = {};
  if (prices_raw) {
    try {
      prices = JSON.parse(prices_raw);
    } catch {
      prices = {};
    }
  }

  const original_prices_raw = formData.get("original_prices") as string;
  let original_prices = {};
  if (original_prices_raw) {
    try {
      original_prices = JSON.parse(original_prices_raw);
    } catch {
      original_prices = {};
    }
  }

  const payload = {
    id,
    game_id,
    name,
    names,
    price: priceRaw ? parseFloat(priceRaw) : 0,
    prices,
    active,
    image_url,
    is_flash_sale,
    original_price: original_price_raw ? parseFloat(original_price_raw) : null,
    original_prices,
    flash_sale_stock: flash_sale_stock_raw ? parseInt(flash_sale_stock_raw, 10) : 0,
    variant_type: variant_type_raw || null,
  };

  const res = await saveProductAction(payload);
  if (!res.success) {
    return { error: res.error || "Gagal menyimpan produk." };
  }
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { data: prod } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    const { error } = await supabase.from("products").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;

    await logActivity({
      action: "DELETE",
      entity: "product",
      entityId: id,
      tenantId: tenant_id,
      description: `Menghapus produk "${prod?.name || id}"`,
      payload: {
        deleted_product: prod || { id },
      },
    });

    revalidatePath("/admin/products");
    revalidateStorefront();
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

    const { data: clonedProd, error: insertError } = await supabase
      .from("products")
      .insert([productWithoutId])
      .select()
      .single();

    if (insertError) throw insertError;

    await logActivity({
      action: "DUPLICATE",
      entity: "product",
      entityId: clonedProd?.id || id,
      tenantId: tenant_id,
      description: `Menduplikasi produk "${product.name}" menjadi "${productWithoutId.name}"`,
      payload: {
        source_product_id: id,
        cloned_product_id: clonedProd?.id,
        source_product_name: product.name,
        new_product_name: productWithoutId.name,
        attributes: productWithoutId,
      },
    });

    revalidatePath("/admin/products");
    revalidateStorefront();
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
    const { data: prod } = await supabase
      .from("products")
      .select("name")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    const { error } = await supabase
      .from("products")
      .update({ active })
      .eq("id", id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;

    await logActivity({
      action: "TOGGLE_STATUS",
      entity: "product",
      entityId: id,
      tenantId: tenant_id,
      description: `Mengubah status produk "${prod?.name || id}" menjadi ${active ? "Aktif ✅" : "Non-aktif ❌"}`,
      payload: {
        product_id: id,
        product_name: prod?.name,
        active,
      },
    });

    revalidatePath("/admin/products");
    revalidateStorefront();
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to update product status." };
  }
}
