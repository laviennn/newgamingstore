"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { logActivity } from "@/lib/activity-logger";

export async function adminUpdateOrderStatus(invoiceId: string, status: string, paymentStatus: string) {
  try {
    const supabase = await createClient();
    const tenant_id = await getActiveAdminTenantId();
    
    if (!tenant_id) return { success: false, message: "No active tenant selected." };

    // Fetch previous order snapshot with game & product names
    const { data: previousOrder } = await supabase
      .from('orders')
      .select('id, invoice_id, status, payment_status, total_price, customer_email, games(name), products(name)')
      .eq('invoice_id', invoiceId)
      .eq('tenant_id', tenant_id)
      .maybeSingle();

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

    const isPaymentApproval = paymentStatus === 'PAID' && previousOrder?.payment_status !== 'PAID';
    const action = isPaymentApproval ? 'APPROVE' : 'UPDATE';
    const actionDesc = isPaymentApproval 
      ? `Menyetujui pembayaran pesanan ${invoiceId} (${status} - PAID)`
      : `Memperbarui status pesanan ${invoiceId} (Status: ${status}, Pembayaran: ${paymentStatus})`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gameName = (previousOrder?.games as any)?.name;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productName = (previousOrder?.products as any)?.name;

    await logActivity({
      action,
      entity: "order",
      entityId: invoiceId,
      tenantId: tenant_id,
      description: actionDesc,
      payload: {
        invoice_id: invoiceId,
        previous_status: previousOrder?.status,
        new_status: status,
        previous_payment_status: previousOrder?.payment_status,
        new_payment_status: paymentStatus,
        total_price: previousOrder?.total_price,
        customer_email: previousOrder?.customer_email,
        game_name: gameName,
        product_name: productName,
      },
    });
    
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (err: any) {
    console.error("adminUpdateOrderStatus exception:", err);
    return { success: false, message: err.message || "Gagal memperbarui status" };
  }
}

export async function deleteOrder(invoiceId: string) {
  try {
    const supabase = await createClient();
    const tenant_id = await getActiveAdminTenantId();
    
    if (!tenant_id) return { success: false, message: "No active tenant selected." };

    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('invoice_id', invoiceId)
      .eq('tenant_id', tenant_id)
      .maybeSingle();

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('invoice_id', invoiceId)
      .eq('tenant_id', tenant_id);
      
    if (error) {
       console.error("Failed to delete order:", error);
       return { success: false, message: error.message };
    }

    await logActivity({
      action: "DELETE",
      entity: "order",
      entityId: invoiceId,
      tenantId: tenant_id,
      description: `Menghapus pesanan invoice ${invoiceId}`,
      payload: {
        deleted_order: order || { invoice_id: invoiceId },
      },
    });
    
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (err: any) {
    console.error("deleteOrder exception:", err);
    return { success: false, message: err.message || "Gagal menghapus order" };
  }
}
