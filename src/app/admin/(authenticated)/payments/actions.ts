"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { logActivity, calculateDiffs } from "@/lib/activity-logger";

export async function savePayment(formData: FormData, id?: string) {
  const category = formData.get("category") as string;
  const name = formData.get("name") as string;
  const logo_url = formData.get("logo_url") as string;
  const qr_image_url = formData.get("qr_image_url") as string;
  const account_number = formData.get("account_number") as string;
  const account_name = formData.get("account_name") as string;
  const is_active_raw = formData.get("is_active") as string;
  const is_active = is_active_raw === "true";

  if (!category || !name) {
    return { error: "Kategori dan Nama Pembayaran wajib diisi." };
  }

  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  const paymentData = {
    category,
    name,
    account_number,
    account_name,
    logo_url,
    qr_image_url,
    is_active,
  };

  try {
    if (id) {
      const { data: previousPay } = await supabase
        .from("payment_channels")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenant_id)
        .maybeSingle();

      const { error } = await supabase
        .from("payment_channels")
        .update(paymentData)
        .eq("id", id)
        .eq("tenant_id", tenant_id);
      if (error) throw error;

      const diffResult = calculateDiffs(previousPay, paymentData);
      await logActivity({
        action: "UPDATE",
        entity: "payment_channel",
        entityId: id,
        tenantId: tenant_id,
        description: `Memperbarui saluran pembayaran "${name}" (${diffResult.diffs.length} perubahan)`,
        payload: {
          payment_id: id,
          name,
          category,
          previous: diffResult.previous,
          updated: diffResult.updated,
          diffs: diffResult.diffs,
        },
      });
    } else {
      const { data: newPay, error } = await supabase
        .from("payment_channels")
        .insert([{ tenant_id, ...paymentData }])
        .select()
        .single();
      if (error) throw error;

      await logActivity({
        action: "CREATE",
        entity: "payment_channel",
        entityId: newPay?.id,
        tenantId: tenant_id,
        description: `Menambahkan saluran pembayaran baru "${name}" (${category})`,
        payload: {
          payment_id: newPay?.id,
          ...paymentData,
        },
      });
    }

    revalidatePath("/admin/payments");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menyimpan metode pembayaran." };
  }
}

export async function togglePaymentStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { data: pay } = await supabase
      .from("payment_channels")
      .select("name, category")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    const nextStatus = !currentStatus;
    const { error } = await supabase
      .from("payment_channels")
      .update({ is_active: nextStatus })
      .eq("id", id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;

    await logActivity({
      action: "TOGGLE_STATUS",
      entity: "payment_channel",
      entityId: id,
      tenantId: tenant_id,
      description: `Mengubah status saluran pembayaran "${pay?.name || id}" menjadi ${nextStatus ? "Aktif ✅" : "Non-aktif ❌"}`,
      payload: {
        payment_id: id,
        name: pay?.name,
        is_active: nextStatus,
      },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal mengubah status pembayaran." };
  }
}

export async function deletePayment(id: string) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { data: pay } = await supabase
      .from("payment_channels")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    const { error } = await supabase.from("payment_channels").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) {
      // If error is foreign key violation (e.g. linked to existing orders/deposits)
      if (error.code === "23503" || error.message?.includes("foreign key constraint") || error.message?.includes("violates")) {
        // Automatically deactivate instead instead of hard delete to preserve historical order logs
        await supabase.from("payment_channels").update({ is_active: false }).eq("id", id).eq("tenant_id", tenant_id);

        await logActivity({
          action: "UPDATE",
          entity: "payment_channel",
          entityId: id,
          tenantId: tenant_id,
          description: `Menonaktifkan saluran pembayaran "${pay?.name || id}" (memiliki riwayat transaksi)`,
          payload: {
            payment_id: id,
            payment_channel: pay,
            action_type: "soft_deactivate",
          },
        });

        revalidatePath("/admin/payments");
        revalidatePath("/");
        return { 
          success: true, 
          deactivated: true, 
          message: "Channel ini tidak dapat dihapus permanen karena memiliki riwayat pesanan. Statusnya telah otomatis diubah menjadi NONAKTIF." 
        };
      }
      throw error;
    }

    await logActivity({
      action: "DELETE",
      entity: "payment_channel",
      entityId: id,
      tenantId: tenant_id,
      description: `Menghapus permanen saluran pembayaran "${pay?.name || id}"`,
      payload: {
        deleted_payment: pay || { id },
        action_type: "hard_delete",
      },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menghapus pembayaran." };
  }
}
