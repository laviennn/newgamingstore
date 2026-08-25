"use server";

import { createClient } from "@/utils/supabase/server";

export async function validatePromoCode(code: string) {
  if (!code) {
    return { success: false, message: "Kode promo tidak boleh kosong" };
  }

  const supabase = await createClient();

  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (error || !promo) {
    return { success: false, message: "Kode promo tidak ditemukan atau sudah tidak aktif" };
  }

  // Check quota
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    return { success: false, message: "Kode promo sudah mencapai batas kuota penggunaan" };
  }

  return { success: true, promo };
}

export async function getAvailablePromos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("code, discount_type, discount_value, max_uses, used_count")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return [];
  
  // Filter out those that have reached max uses
  return data.filter(p => p.max_uses === null || p.used_count < p.max_uses);
}
