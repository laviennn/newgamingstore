"use server";

import { createClient } from "@/utils/supabase/server";
import { generateInvoiceId } from "@/lib/invoiceUtils";

import { getMemberSession } from "@/utils/memberSession";

export async function createOrder(orderData: any) {
  try {
    const supabase = await createClient();
    
    // Determine tenant name from config or use default
    // We could pass tenantName from the client config
    const tenantName = orderData.tenantName || "NewGamingStore";
    const invoiceId = generateInvoiceId(tenantName);

    const { data: tenantData } = await supabase.from('tenants').select('theme_config').eq('id', orderData.tenantId).single();
    const currency = tenantData?.theme_config?.currency || (tenantData?.theme_config?.language === 'ms' ? 'MYR' : 'IDR');

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

    // Check if user is logged in (supports both Username mode and Supabase Email mode)
    let loggedInEmail: string | null = null;
    let loggedInPhone: string | null = null;

    // 1. Try Custom Member Session (Username Auth Mode)
    const memberSession = await getMemberSession();
    if (memberSession) {
      loggedInEmail = `${memberSession.username}@${memberSession.tenantId}.member`.toLowerCase();
      const { data: memberData } = await supabase
        .from('members')
        .select('phone')
        .eq('id', memberSession.memberId)
        .maybeSingle();
      if (memberData?.phone) {
        loggedInPhone = memberData.phone;
      }
    }

    // 2. Try Supabase Auth (Email Auth Mode) if not in username session
    if (!loggedInEmail) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.email) {
        loggedInEmail = authData.user.email.toLowerCase();
        loggedInPhone = authData.user.user_metadata?.phone || null;
      }
    }

    const isWalletPayment = orderData.paymentMethodId === '11111111-1111-1111-1111-111111111111';

    // If Payment Method is Wallet, deduct balance first
    if (isWalletPayment) {
      if (!loggedInEmail) {
        return { success: false, message: "Harap login terlebih dahulu untuk menggunakan Saldo Akun." };
      }
      
      const { error: rpcError } = await supabase.rpc('deduct_wallet_balance', {
        p_email: loggedInEmail,
        p_amount: totalPrice,
        p_tenant_id: orderData.tenantId
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
       wa_number: orderData.waNumber || loggedInPhone || null,
       original_price: originalPrice,
       discount_amount: discountAmount,
       fee: fee,
       total_price: totalPrice,
       status: isWalletPayment ? 'Processed' : 'Pending',
       payment_status: isWalletPayment ? 'PAID' : 'UNPAID',
       customer_email: loggedInEmail || orderData.customerEmail || orderData.waNumber || 'no-email@test.com', // accurately use member email
       form_data: orderData.accountData, // fallback for original schema
       currency: currency
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
