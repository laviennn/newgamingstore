"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getPromoCodes() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return [];

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("tenant_id", tenant_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching promo codes:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function savePromoCode(promo: any) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) throw new Error("No active tenant selected.");

  if (promo.id) {
    const { error } = await supabase
      .from("promo_codes")
      .update({
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        max_uses: promo.max_uses,
        is_active: promo.is_active,
      })
      .eq("id", promo.id)
      .eq("tenant_id", tenant_id);
      
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("promo_codes")
      .insert({
        tenant_id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        max_uses: promo.max_uses,
        is_active: promo.is_active,
      });
      
    if (error) throw new Error(error.message);
  }
  
  revalidatePath("/admin/promos");
  return { success: true };
}

export async function deletePromoCode(id: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) throw new Error("No active tenant selected.");

  const { error } = await supabase.from("promo_codes").delete().eq("id", id).eq("tenant_id", tenant_id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/promos");
  return { success: true };
}
