"use server";

import { createClient } from "@/utils/supabase/server";
import { generateInvoiceId } from "@/lib/invoiceUtils";
import { getMemberSession } from "@/utils/memberSession";
import { Currency, getProductPrice, getProductOriginalPrice, isProductAvailableInCurrency } from "@/lib/currencyUtils";

export async function createOrder(orderData: any) {
  try {
    const supabase = await createClient();
    
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('name, domain, theme_config')
      .eq('id', orderData.tenantId)
      .maybeSingle();

    const tenantIdentifier = tenantData?.theme_config?.siteName || tenantData?.name || tenantData?.domain || orderData.tenantName || "NewGamingStore";
    const invoiceId = generateInvoiceId(tenantIdentifier);

    // 1. Resolve requested currency safely
    const defaultCurrency = (tenantData?.theme_config?.default_currency || tenantData?.theme_config?.currency || (tenantData?.theme_config?.language === 'ms' ? 'MYR' : 'IDR')) as Currency;
    const requestedCurrency: Currency = (orderData.currency as Currency) || defaultCurrency;

    // 2. Fetch authoritative Product from database (Anti-Fraud verification)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, names, price, prices, active, is_flash_sale, original_price, original_prices')
      .eq('id', orderData.productId)
      .eq('tenant_id', orderData.tenantId)
      .single();

    if (productError || !product || !product.active) {
      return { success: false, message: "Produk tidak ditemukan atau sedang tidak aktif." };
    }

    // Check if product is actually offered / priced in the requested currency
    if (!isProductAvailableInCurrency(product, requestedCurrency)) {
      return {
        success: false,
        message: `Produk "${product.name}" tidak tersedia untuk wilayah / mata uang ${requestedCurrency}.`,
      };
    }

    // 3. Authoritative price calculation based on requested currency
    const serverProductPrice = getProductPrice(product, requestedCurrency);
    if (serverProductPrice <= 0) {
      return {
        success: false,
        message: `Harga produk tidak valid untuk mata uang ${requestedCurrency}.`,
      };
    }
    const serverOriginalPrice = getProductOriginalPrice(product, requestedCurrency) || serverProductPrice;

    // 4. Calculate total price with promo
    let originalPrice = serverProductPrice;
    let totalPrice = serverProductPrice;
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

    const fee = 0;
    totalPrice += fee;

    // 5. Payment Channel Currency Validation
    const isWalletPayment = orderData.paymentMethodId === '11111111-1111-1111-1111-111111111111';

    if (!isWalletPayment) {
      const { data: channel, error: channelError } = await supabase
        .from('payment_channels')
        .select('id, name, supported_currencies, is_active')
        .eq('id', orderData.paymentMethodId)
        .eq('tenant_id', orderData.tenantId)
        .maybeSingle();

      if (channelError || !channel || !channel.is_active) {
        return { success: false, message: "Metode pembayaran tidak valid atau sedang dinonaktifkan." };
      }

      if (Array.isArray(channel.supported_currencies) && channel.supported_currencies.length > 0) {
        if (!channel.supported_currencies.includes(requestedCurrency)) {
          return {
            success: false,
            message: `Metode pembayaran ${channel.name} tidak berlaku untuk transaksi dengan mata uang ${requestedCurrency}.`,
          };
        }
      }
    }

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
       tenant_id: orderData.tenantId,
       account_data: orderData.accountData,
       promo_code_id: orderData.promo?.id || null,
       wa_number: orderData.waNumber || loggedInPhone || null,
       original_price: originalPrice,
       discount_amount: discountAmount,
       fee: fee,
       total_price: totalPrice,
       status: isWalletPayment ? 'Processed' : 'Pending',
       payment_status: isWalletPayment ? 'PAID' : 'UNPAID',
       customer_email: loggedInEmail || orderData.customerEmail || orderData.waNumber || 'no-email@test.com',
       form_data: orderData.accountData,
       currency: requestedCurrency
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
      .select('*, games(name), products(name, names)')
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
