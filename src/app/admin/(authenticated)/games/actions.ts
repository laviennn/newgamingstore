"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { logActivity, calculateDiffs } from "@/lib/activity-logger";

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
  
  const has_username_validator = formData.get("has_username_validator") === "true";
  const validator_provider = formData.get("validator_provider") as string || null;
  const validator_game_code = formData.get("validator_game_code") as string || null;
  const sort_order_raw = formData.get("sort_order") as string;
  const sort_order = sort_order_raw !== null && sort_order_raw !== "" ? parseInt(sort_order_raw, 10) : 0;

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
  let tenant_id = await getActiveAdminTenantId();

  if (!tenant_id && id) {
    const { data: existingGame } = await supabase
      .from("games")
      .select("tenant_id")
      .eq("id", id)
      .maybeSingle();
    if (existingGame?.tenant_id) {
      tenant_id = existingGame.tenant_id;
    }
  }

  if (!tenant_id) {
    return { error: "No active tenant selected." };
  }

  const gameData = {
    name,
    slug,
    image_url,
    form_fields,
    developer,
    background_image,
    category_id,
    is_popular,
    topup_instructions,
    guide_image_url,
    guide_text,
    has_username_validator,
    validator_provider,
    validator_game_code,
    sort_order,
  };

  try {
    if (id) {
      // Fetch previous state for diff calculation
      const { data: previousGame } = await supabase
        .from("games")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenant_id)
        .maybeSingle();

      const { error } = await supabase
        .from("games")
        .update(gameData)
        .eq("id", id)
        .eq("tenant_id", tenant_id);
      if (error) throw error;

      const diffResult = calculateDiffs(previousGame, gameData);
      await logActivity({
        action: "UPDATE",
        entity: "game",
        entityId: id,
        tenantId: tenant_id,
        description: `Memperbarui detail game "${name}" (${diffResult.diffs.length} atribut diubah)`,
        payload: {
          game_id: id,
          game_name: name,
          previous: diffResult.previous,
          updated: diffResult.updated,
          diffs: diffResult.diffs,
        },
      });
    } else {
      const { data: newGame, error } = await supabase
        .from("games")
        .insert([{ tenant_id, ...gameData }])
        .select()
        .single();
      if (error) throw error;

      await logActivity({
        action: "CREATE",
        entity: "game",
        entityId: newGame?.id,
        tenantId: tenant_id,
        description: `Menambahkan game baru "${name}" ke katalog`,
        payload: {
          game_id: newGame?.id,
          ...gameData,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/games");
    revalidatePath("/admin/products");
    revalidateStorefront();
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to save game." };
  }
}

export async function toggleGamePopular(id: string, is_popular: boolean) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { data: game } = await supabase
      .from("games")
      .select("name")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    const { error } = await supabase
      .from("games")
      .update({ is_popular })
      .eq("id", id)
      .eq("tenant_id", tenant_id);
    if (error) throw error;

    await logActivity({
      action: "TOGGLE_STATUS",
      entity: "game",
      entityId: id,
      tenantId: tenant_id,
      description: `Mengubah status populer game "${game?.name || id}" menjadi ${is_popular ? "Populer ⭐" : "Biasa"}`,
      payload: {
        game_id: id,
        game_name: game?.name,
        is_popular,
      },
    });

    revalidatePath("/admin/games");
    revalidatePath("/");
    revalidateStorefront();
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to toggle popular status." };
  }
}

export async function deleteGame(id: string) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const { data: game } = await supabase
      .from("games")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    const { error } = await supabase.from("games").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;

    await logActivity({
      action: "DELETE",
      entity: "game",
      entityId: id,
      tenantId: tenant_id,
      description: `Menghapus game "${game?.name || id}" beserta produk terkait`,
      payload: {
        deleted_game: game || { id },
      },
    });

    revalidatePath("/admin/games");
    revalidatePath("/admin/products");
    revalidateStorefront();
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to delete game." };
  }
}

export async function updateGamesOrder(orderedIds: string[]) {
  const supabase = await createClient();
  const tenant_id = await getActiveAdminTenantId();
  if (!tenant_id) return { error: "No active tenant selected." };

  try {
    const updates = orderedIds.map((id, index) =>
      supabase
        .from("games")
        .update({ sort_order: index + 1 })
        .eq("id", id)
        .eq("tenant_id", tenant_id)
    );

    const results = await Promise.all(updates);
    const firstError = results.find(r => r.error)?.error;
    if (firstError) throw firstError;

    await logActivity({
      action: "REORDER",
      entity: "game",
      tenantId: tenant_id,
      description: `Mengubah urutan tampilan katalog (${orderedIds.length} game)`,
      payload: {
        total_games_reordered: orderedIds.length,
        ordered_ids: orderedIds,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/games");
    revalidateStorefront();
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || "Failed to update games order." };
  }
}
