"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function adminUpdateOrderStatus(invoiceId: string, status: string, paymentStatus: string) {
  try {
    const supabase = await createClient();
    
    // Optional: Add admin role check if needed, but the RLS policy should handle it assuming user is authenticated
    
    const { error } = await supabase
      .from('orders')
      .update({ 
         status: status, 
         payment_status: paymentStatus 
      })
      .eq('invoice_id', invoiceId);
      
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
