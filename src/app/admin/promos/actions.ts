"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPromoCodes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching promo codes:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function savePromoCode(promo: any) {
  const supabase = await createClient();
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
      .eq("id", promo.id);
      
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("promo_codes")
      .insert({
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
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/promos");
  return { success: true };
}
