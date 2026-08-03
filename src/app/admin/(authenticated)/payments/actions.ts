"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    if (id) {
      const { error } = await supabase
        .from("payment_channels")
        .update({ category, name, account_number, account_name, logo_url, qr_image_url, is_active })
        .eq("id", id)
        .eq("tenant_id", tenant_id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("payment_channels")
        .insert([{ tenant_id, category, name, account_number, account_name, logo_url, qr_image_url, is_active }]);
      if (error) throw error;
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
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase
      .from("payment_channels")
      .update({ is_active: !currentStatus })
      .eq("id", id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;

    revalidatePath("/admin/payments");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal mengubah status pembayaran." };
  }
}

export async function deletePayment(id: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase.from("payment_channels").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) {
      // If error is foreign key violation (e.g. linked to existing orders/deposits)
      if (error.code === "23503" || error.message?.includes("foreign key constraint") || error.message?.includes("violates")) {
        // Automatically deactivate instead instead of hard delete to preserve historical order logs
        await supabase.from("payment_channels").update({ is_active: false }).eq("id", id).eq("tenant_id", tenant_id);
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

    revalidatePath("/admin/payments");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menghapus pembayaran." };
  }
}
