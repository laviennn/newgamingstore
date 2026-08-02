import { createClient } from "@/utils/supabase/server";
import { GamesClient } from "./GamesClient";

export default async function GamesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let games: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data, error } = await supabase.from('games').select('*, categories(name)').order('created_at', { ascending: false });
      if (!error && data) games = data;

      const { data: catData } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (catData) categories = catData;
    }
  } catch (err) {
    console.error("Failed to fetch games", err);
  }

  return (
    <div className="space-y-6">
       <GamesClient initialGames={games} categories={categories} />
    </div>
  );
}
