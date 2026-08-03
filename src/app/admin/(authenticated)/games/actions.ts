"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function saveGame(formData: FormData, id?: string) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const image_url = formData.get("image_url") as string;
  const form_fields_raw = formData.get("form_fields") as string;
  const developer = formData.get("developer") as string;
  const background_image = formData.get("background_image") as string;
  const category_id_raw = formData.get("category_id") as string;
  const category_id = category_id_raw === "" ? null : category_id_raw;
  const is_popular = formData.get("is_popular") === "true";
  
  const topup_instructions = formData.get("topup_instructions") as string;
  const guide_image_url = formData.get("guide_image_url") as string;
  const guide_text = formData.get("guide_text") as string;

  if (!name || !slug) {
    return { error: "Name and Slug are required." };
  }

  let form_fields = [];
  try {
    if (form_fields_raw) {
      form_fields = JSON.parse(form_fields_raw);
    }
  } catch {
    return { error: "Invalid JSON format for form fields." };
  }

  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;

  if (!tenant_id) {
    return { error: "No active tenant selected." };
  }

  try {
    if (id) {
      const { error } = await supabase
        .from("games")
        .update({ name, slug, image_url, form_fields, developer, background_image, category_id, is_popular, topup_instructions, guide_image_url, guide_text })
        .eq("id", id)
        .eq("tenant_id", tenant_id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("games")
        .insert([{ tenant_id, name, slug, image_url, form_fields, developer, background_image, category_id, is_popular, topup_instructions, guide_image_url, guide_text }]);
      if (error) throw error;
    }

    revalidatePath("/admin/games");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to save game." };
  }
}

export async function toggleGamePopular(id: string, is_popular: boolean) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase
      .from("games")
      .update({ is_popular })
      .eq("id", id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;
    revalidatePath("/admin/games");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to toggle popular status." };
  }
}

export async function deleteGame(id: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const tenant_id = cookieStore.get("admin_tenant_id")?.value;
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { error } = await supabase.from("games").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;
    revalidatePath("/admin/games");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to delete game." };
  }
}
