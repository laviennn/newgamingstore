"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { logActivity, calculateDiffs } from "@/lib/activity-logger";

export interface ContactSettingsPayload {
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  email?: string;
  operationalHours?: string;
  footerBannerUrl?: string;
  waFloatingActive?: boolean;
  waFloatingAvatarUrl?: string;
  waFloatingText?: string;
  waDefaultMessage?: string;
  waOrderConfirmTemplate?: string;
  waDepositConfirmTemplate?: string;
  waChannelActive?: boolean;
  waChannelUrl?: string;
}

export async function saveContactSettings(settings: ContactSettingsPayload) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { success: false, message: "No active tenant selected." };

  try {
    const { data: tenant, error: fetchError } = await supabase
      .from("tenants")
      .select("id, name, theme_config")
      .eq("id", tenant_id)
      .single();

    if (fetchError || !tenant) {
      throw new Error("Tenant tidak ditemukan.");
    }

    const previousConfig = tenant.theme_config || {};
    const updatedConfig = {
      ...previousConfig,
      ...settings,
    };

    const { error: updateError } = await supabase
      .from("tenants")
      .update({ theme_config: updatedConfig })
      .eq("id", tenant_id);

    if (updateError) throw updateError;

    // Calculate diffs on contact-related micro fields
    const contactKeys = [
      "whatsapp",
      "instagram",
      "tiktok",
      "youtube",
      "email",
      "operationalHours",
      "footerBannerUrl",
      "waFloatingActive",
      "waFloatingAvatarUrl",
      "waFloatingText",
      "waDefaultMessage",
      "waOrderConfirmTemplate",
      "waDepositConfirmTemplate",
      "waChannelActive",
      "waChannelUrl",
    ];

    const diffResult = calculateDiffs(previousConfig, settings, contactKeys);

    await logActivity({
      action: "UPDATE",
      entity: "contact_settings",
      entityId: tenant_id,
      tenantId: tenant_id,
      description: `Memperbarui pengaturan kontak & branding (${diffResult.diffs.length} field diubah)`,
      payload: {
        tenant_id,
        tenant_name: tenant.name,
        previous: diffResult.previous,
        updated: diffResult.updated,
        diffs: diffResult.diffs,
      },
    });

    revalidatePath("/admin/contacts");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, message: error.message || "Gagal menyimpan pengaturan kontak." };
  }
}
