"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function saveArticle(formData: FormData, id?: string) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const image_url = formData.get("image_url") as string;
  const author = formData.get("author") as string || "Admin";
  const is_published_raw = formData.get("is_published") as string;
  const is_published = is_published_raw === "true";

  if (!title || !slug) {
    return { error: "Judul dan Slug wajib diisi." };
  }

  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    if (id) {
      const { error } = await supabase
        .from("articles")
        .update({ title, slug, content, image_url, author, is_published })
        .eq("id", id)
        .eq("tenant_id", tenant_id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("articles")
        .insert([{ tenant_id, title, slug, content, image_url, author, is_published }]);
      if (error) throw error;
    }

    revalidatePath("/admin/articles");
    revalidatePath("/");
    revalidatePath("/blog");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menyimpan artikel." };
  }
}

export async function toggleArticleStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase
      .from("articles")
      .update({ is_published: !currentStatus })
      .eq("id", id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;

    revalidatePath("/admin/articles");
    revalidatePath("/");
    revalidatePath("/blog");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal mengubah status artikel." };
  }
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase.from("articles").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;

    revalidatePath("/admin/articles");
    revalidatePath("/");
    revalidatePath("/blog");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Gagal menghapus artikel." };
  }
}
