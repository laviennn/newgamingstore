"use server";

import { createClient } from "@/utils/supabase/server";
import { generateInvoiceId } from "@/lib/invoiceUtils";

export async function createOrder(orderData: any) {
  try {
    const supabase = await createClient();
    
    // Determine tenant name from config or use default
    // We could pass tenantName from the client config
    const tenantName = orderData.tenantName || "NewGamingStore";
    const invoiceId = generateInvoiceId(tenantName);

    // Calculate total price with promo
    let originalPrice = orderData.productPrice;
    let totalPrice = originalPrice;
    let discountAmount = 0;
    
    if (orderData.promo) {
       if (orderData.promo.discount_type === 'percentage') {
          discountAmount = totalPrice * (orderData.promo.discount_value / 100);
       } else {
          discountAmount = orderData.promo.discount_value;
       }
       totalPrice = totalPrice - discountAmount;
       if (totalPrice < 0) totalPrice = 0;
    }

    // Biaya dihapus sesuai request
    const fee = 0;
    totalPrice += fee;

    // Check if user is logged in to associate order with member email
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    const isWalletPayment = orderData.paymentMethodId === '11111111-1111-1111-1111-111111111111';

    // If Payment Method is Wallet, deduct balance first
    if (isWalletPayment) {
      if (!currentUser?.email) {
        return { success: false, message: "Harap login terlebih dahulu untuk menggunakan Saldo Akun." };
      }
      
      const { error: rpcError } = await supabase.rpc('deduct_wallet_balance', {
        p_email: currentUser.email.toLowerCase(),
        p_amount: totalPrice
      });
      
      if (rpcError) {
        console.error("Wallet deduction error:", rpcError);
        return { success: false, message: rpcError.message || "Gagal memotong saldo, pastikan saldo mencukupi." };
      }
    }

    const payload = {
       invoice_id: invoiceId,
       game_id: orderData.gameId,
       product_id: orderData.productId,
       payment_channel_id: orderData.paymentMethodId,
       tenant_id: orderData.tenantId, // Can be null if not multi-tenant strictly
       account_data: orderData.accountData,
       promo_code_id: orderData.promo?.id || null,
       wa_number: orderData.waNumber,
       original_price: originalPrice,
       discount_amount: discountAmount,
       fee: fee,
       total_price: totalPrice,
       status: isWalletPayment ? 'Processed' : 'Pending',
       payment_status: isWalletPayment ? 'PAID' : 'UNPAID',
       customer_email: currentUser?.email || orderData.waNumber || 'no-email@test.com', // use member email if logged in
       form_data: orderData.accountData // fallback for original schema
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(payload)
      .select()
      .single();

    if (error) {
       console.error("Order insertion error:", error);
       // If orders table doesn't exist yet, we will fallback to returning the invoice ID 
       // so the UI can still proceed without breaking in development.
       if (error.code === '42P01') { // relation "orders" does not exist
          console.warn("Table 'orders' does not exist. Please run migration. Simulating success...");
          return { success: true, invoiceId: invoiceId };
       }
       return { success: false, message: error.message };
    }

    return { success: true, invoiceId: data.invoice_id };
  } catch (err: any) {
    console.error("createOrder exception:", err);
    return { success: false, message: err.message || "Failed to create order" };
  }
}

export async function updatePaymentProof(invoiceId: string, url: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_proof_url: url, payment_status: 'PAID' })
      .eq('invoice_id', invoiceId)
      .select();
      
    if (error) {
       console.error("Failed to update payment proof:", error);
       return { success: false, message: "Gagal menyimpan bukti transfer ke sistem." };
    }

    if (!data || data.length === 0) {
       console.warn("Update returned 0 rows for invoice:", invoiceId);
       return { success: false, message: "Akses ditolak oleh database (RLS) atau pesanan tidak ditemukan." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("updatePaymentProof exception:", err);
    return { success: false, message: "Terjadi kesalahan internal saat menyimpan data." };
  }
}

export async function checkOrderStatus(invoiceId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, games(name), products(name)')
      .eq('invoice_id', invoiceId)
      .single();

    if (error || !data) {
      return { success: false, message: "Pesanan dengan Invoice ID tersebut tidak ditemukan." };
    }

    return { success: true, order: data };
  } catch (err: any) {
    console.error("checkOrderStatus exception:", err);
    return { success: false, message: "Terjadi kesalahan sistem saat melacak pesanan." };
  }
}
