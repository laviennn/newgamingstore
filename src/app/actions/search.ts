"use server";

import { createClient } from "@/utils/supabase/server";

export async function searchGames(query: string) {
  if (!query || query.trim() === "") {
    return { success: true, games: [] };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("games")
      .select("id, name, slug, image_url")
      .ilike("name", `%${query.trim()}%`)
      .limit(6);

    if (error) {
      console.error("Search error:", error);
      return { success: false, games: [] };
    }

    return { success: true, games: data || [] };
  } catch (err) {
    console.error("Search exception:", err);
    return { success: false, games: [] };
  }
}
