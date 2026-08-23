"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { logActivity, calculateDiffs } from "@/lib/activity-logger";

export interface ContactSettingsPayload {
  whatsapp?: string;
  whatsapp_contacts?: Record<string, string>;
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
    const defaultCurrency = previousConfig.default_currency || (previousConfig.language === 'ms' ? 'MYR' : 'IDR');
    
    // Determine the primary fallback whatsapp number from default region or IDR
    const resolvedPrimaryWhatsapp = 
      (settings.whatsapp_contacts && settings.whatsapp_contacts[defaultCurrency]) ||
      (settings.whatsapp_contacts && settings.whatsapp_contacts.IDR) ||
      settings.whatsapp ||
      previousConfig.whatsapp ||
      "";

    const updatedConfig = {
      ...previousConfig,
      ...settings,
      whatsapp: resolvedPrimaryWhatsapp,
    };

    const { error: updateError } = await supabase
      .from("tenants")
      .update({ theme_config: updatedConfig })
      .eq("id", tenant_id);

    if (updateError) throw updateError;

    // Calculate diffs on contact-related micro fields
    const contactKeys = [
      "whatsapp",
      "whatsapp_contacts",
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
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, message: error.message || "Gagal menyimpan pengaturan kontak." };
  }
}
