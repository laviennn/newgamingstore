"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveAdminTenantId } from "@/app/admin/actions";

export async function createReview(data: any) {
  const supabase = await createClient();
  const tenantId = await getActiveAdminTenantId();
  if (!tenantId) return { success: false, message: "Unauthorized" };

  const { error } = await supabase.from('reviews').insert([{ ...data, tenant_id: tenantId }]);
  
  if (error) {
    console.error("Create Review error", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { success: true };
}

export async function updateReview(id: string, data: any) {
  const supabase = await createClient();
  const tenantId = await getActiveAdminTenantId();
  if (!tenantId) return { success: false, message: "Unauthorized" };

  const { error } = await supabase.from('reviews').update(data).eq('id', id).eq('tenant_id', tenantId);
  
  if (error) {
    console.error("Update Review error", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { success: true };
}

export async function deleteReview(id: string) {
  const supabase = await createClient();
  const tenantId = await getActiveAdminTenantId();
  if (!tenantId) return { success: false, message: "Unauthorized" };

  const { error } = await supabase.from('reviews').delete().eq('id', id).eq('tenant_id', tenantId);
  
  if (error) {
    console.error("Delete Review error", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { success: true };
}
