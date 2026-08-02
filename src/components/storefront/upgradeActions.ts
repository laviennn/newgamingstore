"use server";

import { createClient } from "@/utils/supabase/server";

export async function createUpgradeOrder({
  packageName,
  amount,
  paymentChannelId,
  userEmail,
  waNumber,
}: {
  packageName: string;
  amount: number;
  paymentChannelId?: string | null;
  userEmail: string;
  waNumber?: string | null;
}) {
  try {
    const supabase = await createClient();

    // Generate unique invoice_id with UPG prefix
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const invoiceId = `UPG-${Date.now().toString(36).toUpperCase()}${randomCode}`;

    // Insert into deposits table to sync with deposit history & dashboard
    const { error: depositError } = await supabase.from("deposits").insert({
      invoice_id: invoiceId,
      customer_email: userEmail.toLowerCase(),
      wa_number: waNumber || null,
      amount: amount,
      payment_channel_id: paymentChannelId || null,
      status: "Pending",
    });

    if (depositError) {
      console.error("Error creating upgrade deposit invoice:", depositError);
      return { success: false, message: depositError.message };
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
