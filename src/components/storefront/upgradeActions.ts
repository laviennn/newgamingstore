"use server";

import { createClient } from "@/utils/supabase/server";

export async function createUpgradeOrder({
  packageName,
  amount,
  paymentChannelId,
  userEmail,
  waNumber,
  tenantId,
}: {
  packageName: string;
  amount: number;
  paymentChannelId?: string | null;
  userEmail: string;
  waNumber?: string | null;
  tenantId: string;
}) {
  try {
    const supabase = await createClient();

    // Generate unique invoice_id with UPG prefix
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const invoiceId = `UPG-${Date.now().toString(36).toUpperCase()}${randomCode}`;

    const isWalletPayment = paymentChannelId === '11111111-1111-1111-1111-111111111111';

    const { data: tenantData } = await supabase.from('tenants').select('theme_config').eq('id', tenantId).single();
    const currency = tenantData?.theme_config?.currency || (tenantData?.theme_config?.language === 'ms' ? 'MYR' : 'IDR');

    if (isWalletPayment) {
      const { error: rpcError } = await supabase.rpc('deduct_wallet_balance', {
        p_email: userEmail.toLowerCase(),
        p_amount: amount,
        p_tenant_id: tenantId
      });
      
      if (rpcError) {
        console.error("Wallet deduction error:", rpcError);
        return { success: false, message: rpcError.message || "Gagal memotong saldo, pastikan saldo mencukupi." };
      }
    }

    // Insert into deposits table to sync with deposit history & dashboard
    const { error: depositError } = await supabase.from("deposits").insert({
      invoice_id: invoiceId,
      customer_email: userEmail.toLowerCase(),
      wa_number: waNumber || null,
      amount: amount,
      payment_channel_id: paymentChannelId || null,
      status: "Pending", // initial state to allow trigger on update
      metadata: { type: "UPGRADE", package_name: packageName },
      tenant_id: tenantId,
      currency: currency
    });

    if (depositError) {
      console.error("Error creating upgrade deposit invoice:", depositError);
      return { success: false, message: depositError.message };
    }

    if (isWalletPayment) {
      // Trigger the upgrade by updating to Success
      const { error: updateError } = await supabase
        .from("deposits")
        .update({ status: "Success" })
        .eq("invoice_id", invoiceId);
      
      if (updateError) {
        console.error("Error completing wallet upgrade:", updateError);
        // Balance was deducted, but status update failed? Should handle gracefully.
      }
    }

    return {
      success: true,
      invoiceId: invoiceId,
    };
  } catch (error: any) {
    console.error("Error in createUpgradeOrder:", error);
    return { success: false, message: error.message || "Failed to create upgrade order" };
  }
}
