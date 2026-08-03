"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function saveCategory(formData: FormData, id?: string) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const icon_name = formData.get("icon_name") as string;
  const sort_order_raw = formData.get("sort_order") as string;
  const is_active_raw = formData.get("is_active") as string;

  if (!name || !slug) {
    return { error: "Nama dan Slug wajib diisi." };
  }

  const sort_order = sort_order_raw ? parseInt(sort_order_raw, 10) : 0;
  const is_active = is_active_raw === "true";

  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    if (id) {
      const { error } = await supabase
        .from("categories")
        .update({ name, slug, icon_name, sort_order, is_active })
        .eq("id", id)
        .eq("tenant_id", tenant_id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("categories")
        .insert([{ tenant_id, name, slug, icon_name, sort_order, is_active }]);
      if (error) throw error;
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/games");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menyimpan kategori." };
  }
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !currentStatus })
      .eq("id", id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;

    revalidatePath("/admin/categories");
    revalidatePath("/admin/games");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal mengubah status kategori." };
  }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase.from("categories").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;

    revalidatePath("/admin/categories");
    revalidatePath("/admin/games");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menghapus kategori." };
  }
}
