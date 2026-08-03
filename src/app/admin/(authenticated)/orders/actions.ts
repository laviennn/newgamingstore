"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveAdminTenantId } from "@/app/admin/actions";

export async function adminUpdateOrderStatus(invoiceId: string, status: string, paymentStatus: string) {
  try {
    const supabase = await createClient();
    const tenant_id = await getActiveAdminTenantId();
    
    if (!tenant_id) return { success: false, message: "No active tenant selected." };

    const { error } = await supabase
      .from('orders')
      .update({ 
         status: status, 
         payment_status: paymentStatus 
      })
      .eq('invoice_id', invoiceId)
      .eq('tenant_id', tenant_id);
      
    if (error) {
       console.error("Failed to update order status:", error);
       return { success: false, message: error.message };
    }
    
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (err: any) {
    console.error("adminUpdateOrderStatus exception:", err);
    return { success: false, message: err.message || "Gagal memperbarui status" };
  }
}
