"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { logActivity, calculateDiffs } from "@/lib/activity-logger";

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
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  const categoryData = { name, slug, icon_name, sort_order, is_active };

  try {
    if (id) {
      const { data: previousCat } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenant_id)
        .maybeSingle();

      const { error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", id)
        .eq("tenant_id", tenant_id);
      if (error) throw error;

      const diffResult = calculateDiffs(previousCat, categoryData);
      await logActivity({
        action: "UPDATE",
        entity: "category",
        entityId: id,
        tenantId: tenant_id,
        description: `Memperbarui kategori "${name}"`,
        payload: {
          category_id: id,
          category_name: name,
          previous: diffResult.previous,
          updated: diffResult.updated,
          diffs: diffResult.diffs,
        },
      });
    } else {
      const { data: newCat, error } = await supabase
        .from("categories")
        .insert([{ tenant_id, ...categoryData }])
        .select()
        .single();
      if (error) throw error;

      await logActivity({
        action: "CREATE",
        entity: "category",
        entityId: newCat?.id,
        tenantId: tenant_id,
        description: `Menambahkan kategori baru "${name}"`,
        payload: {
          category_id: newCat?.id,
          ...categoryData,
        },
      });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/games");
    revalidatePath("/");
    revalidateStorefront();
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menyimpan kategori." };
  }
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { data: cat } = await supabase
      .from("categories")
      .select("name")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    const nextStatus = !currentStatus;
    const { error } = await supabase
      .from("categories")
      .update({ is_active: nextStatus })
      .eq("id", id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;

    await logActivity({
      action: "TOGGLE_STATUS",
      entity: "category",
      entityId: id,
      tenantId: tenant_id,
      description: `Mengubah status kategori "${cat?.name || id}" menjadi ${nextStatus ? "Aktif ✅" : "Non-aktif ❌"}`,
      payload: {
        category_id: id,
        category_name: cat?.name,
        is_active: nextStatus,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/games");
    revalidatePath("/");
    revalidateStorefront();
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal mengubah status kategori." };
  }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { data: cat } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    const { error } = await supabase.from("categories").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;

    await logActivity({
      action: "DELETE",
      entity: "category",
      entityId: id,
      tenantId: tenant_id,
      description: `Menghapus kategori "${cat?.name || id}"`,
      payload: {
        deleted_category: cat || { id },
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/games");
    revalidatePath("/");
    revalidateStorefront();
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menghapus kategori." };
  }
}
