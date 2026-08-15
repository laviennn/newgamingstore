"use server";

import { createClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/activity-logger";

export async function updateDepositStatusAction(depositId: string, newStatus: string) {
  try {
    const supabase = await createClient();

    // 1. Fetch deposit record
    const { data: deposit, error: fetchErr } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .single();

    if (fetchErr || !deposit) {
      return { success: false, message: "Permohonan deposit tidak ditemukan." };
    }

    const oldStatus = deposit.status;

    // 2. If status is becoming 'Success' and wasn't already 'Success'
    if (newStatus === 'Success' && oldStatus !== 'Success') {
      if (deposit.metadata?.type === 'UPGRADE') {
        // If UPGRADE, upgrade member level
        const pkgName = deposit.metadata?.package_name;
        if (pkgName) {
          const { data: memberData } = await supabase
            .from('members')
            .select('id')
            .eq('tenant_id', deposit.tenant_id)
            .ilike('username', deposit.customer_email.split('@')[0])
            .maybeSingle();

          if (memberData) {
            await supabase
              .from('members')
              .update({ role: pkgName.toUpperCase() })
              .eq('id', memberData.id);
          }
        }
      } else {
        // Normal Deposit -> Credit Wallet Balance
        const targetEmail = deposit.customer_email.toLowerCase();
        const tenantId = deposit.tenant_id;
        const amount = Number(deposit.amount) || 0;

        const { data: currentWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('email', targetEmail)
          .eq('tenant_id', tenantId)
          .maybeSingle();

        const newBalance = (currentWallet?.balance || 0) + amount;

        const { error: walletErr } = await supabase
          .from('wallets')
          .upsert({
            email: targetEmail,
            tenant_id: tenantId,
            balance: newBalance,
            updated_at: new Date().toISOString()
          }, { onConflict: 'email,tenant_id' });

        if (walletErr) {
          console.error("Failed to credit wallet balance:", walletErr);
        }
      }
    }

    // 3. Update deposit status
    const { error: updateErr } = await supabase
      .from('deposits')
      .update({ status: newStatus })
      .eq('id', depositId);

    if (updateErr) {
      return { success: false, message: updateErr.message };
    }

    // 4. Log admin activity
    await logActivity({
      action: newStatus === 'Success' ? 'APPROVE' : newStatus === 'Failed' ? 'REJECT' : 'UPDATE',
      entity: 'payment_channel',
      entityId: depositId,
      description: `Mengubah status deposit ${deposit.invoice_id} dari ${oldStatus} menjadi ${newStatus}`,
      payload: {
        deposit_id: depositId,
        invoice_id: deposit.invoice_id,
        old_status: oldStatus,
        new_status: newStatus,
        amount: deposit.amount,
        customer_email: deposit.customer_email
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error("updateDepositStatusAction error:", err);
    return { success: false, message: err.message || "Terjadi kesalahan internal saat memperbarui status deposit." };
  }
}
