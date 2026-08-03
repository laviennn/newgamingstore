"use server";

import { createClient } from "@/utils/supabase/server";
import { generateInvoiceId } from "@/lib/invoiceUtils";

export async function createDepositOrder(depositData: any) {
  try {
    const supabase = await createClient();
    
    // Check if user is logged in
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    const invoiceId = generateInvoiceId("DEP");

    const payload = {
       invoice_id: invoiceId,
       payment_channel_id: depositData.paymentMethodId,
       wa_number: depositData.waNumber,
       amount: depositData.amount,
       status: 'Pending',
       customer_email: currentUser?.email || depositData.waNumber || 'no-email@test.com',
       tenant_id: depositData.tenantId
    };

    const { data, error } = await supabase
      .from('deposits')
      .insert(payload)
      .select()
      .single();

    if (error) {
       console.error("Deposit insertion error:", error);
       if (error.code === '42P01') { 
          console.warn("Table 'deposits' does not exist. Please run migration.");
          return { success: false, message: "Tabel deposits belum dibuat di database." };
       }
       return { success: false, message: error.message };
    }

    return { success: true, invoiceId: data.invoice_id };
  } catch (err: any) {
    console.error("createDepositOrder exception:", err);
    return { success: false, message: err.message || "Failed to create deposit order" };
  }
}

export async function updateDepositProof(invoiceId: string, url: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('deposits')
      .update({ payment_proof_url: url, status: 'Processed' })
      .eq('invoice_id', invoiceId)
      .select();
      
    if (error) {
       console.error("Failed to update deposit payment proof:", error);
       return { success: false, message: "Gagal menyimpan bukti transfer ke sistem." };
    }

    if (!data || data.length === 0) {
       console.warn("Update returned 0 rows for invoice:", invoiceId);
       return { success: false, message: "Pesanan deposit tidak ditemukan." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("updateDepositProof exception:", err);
    return { success: false, message: "Terjadi kesalahan internal saat menyimpan data." };
  }
}

export async function checkDepositStatus(invoiceId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('deposits')
      .select('*, payment_channels(*)')
      .eq('invoice_id', invoiceId)
      .single();

    if (error || !data) {
      return { success: false, message: "Permohonan deposit dengan Invoice ID tersebut tidak ditemukan." };
    }

    return { success: true, deposit: data };
  } catch (err: any) {
    console.error("checkDepositStatus exception:", err);
    return { success: false, message: "Terjadi kesalahan sistem saat melacak deposit." };
  }
}
