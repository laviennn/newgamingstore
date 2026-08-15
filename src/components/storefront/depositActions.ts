"use server";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { generateInvoiceId } from "@/lib/invoiceUtils";
import { checkRateLimit } from "@/lib/rate-limit";
import { DepositSchema } from "@/schemas/transaction.schema";
import { getMemberSession } from "@/utils/memberSession";

export async function createDepositOrder(depositData: any) {
  try {
    // 1. Validasi Zod Schema Input
    const parseResult = DepositSchema.safeParse(depositData);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(", ");
      return { success: false, message: errorMsg };
    }
    const validData = parseResult.data;

    const supabase = await createClient();
    
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

    // 2. Rate Limiting Check (Max 10 per minute per User / IP)
    const headerList = await headers();
    const clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    const identifier = loggedInEmail || validData.waNumber || clientIp;
    const rateLimit = await checkRateLimit('storefront-mutation', identifier);

    if (!rateLimit.success) {
      return {
        success: false,
        message: `Terlalu banyak permohonan deposit. Silakan coba lagi dalam ${rateLimit.reset} detik.`,
      };
    }

    const invoiceId = generateInvoiceId("DEP", "DEP");

    const { data: tenantData } = await supabase.from('tenants').select('theme_config').eq('id', validData.tenantId).single();
    const currency = tenantData?.theme_config?.currency || (tenantData?.theme_config?.language === 'ms' ? 'MYR' : 'IDR');

    const minDeposit = currency === 'MYR' ? 5 : 10000;
    if (validData.amount < minDeposit) {
      return {
        success: false,
        message: `Minimal deposit adalah ${currency === 'MYR' ? 'RM 5' : 'Rp 10.000'}`,
      };
    }

    const payload = {
       invoice_id: invoiceId,
       payment_channel_id: validData.paymentMethodId,
       wa_number: validData.waNumber || loggedInPhone || null,
       amount: validData.amount,
       status: 'Pending',
       customer_email: loggedInEmail || validData.customerEmail || validData.waNumber || 'no-email@test.com',
       tenant_id: validData.tenantId,
       currency: currency
    };

    const { data, error } = await supabase
      .from('deposits')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
       console.error("Deposit insertion error:", error);
       if (error.code === '42P01') { 
          console.warn("Table 'deposits' does not exist. Please run migration.");
          return { success: false, message: "Tabel deposits belum dibuat di database." };
       }
       return { success: false, message: error.message };
    }

    if (!data) {
      return { success: false, message: "Gagal membuat permohonan deposit. Silakan coba lagi." };
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
      .maybeSingle();

    if (error || !data) {
      return { success: false, message: "Permohonan deposit dengan Invoice ID tersebut tidak ditemukan." };
    }

    return { success: true, deposit: data };
  } catch (err: any) {
    console.error("checkDepositStatus exception:", err);
    return { success: false, message: "Terjadi kesalahan sistem saat melacak deposit." };
  }
}
