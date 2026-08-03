import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GamesClient } from "./GamesClient";
import { checkPermission, getActiveAdminTenantId } from "@/app/admin/actions";
import { redirect } from "next/navigation";

export default async function GamesPage() {
  if (!(await checkPermission("manage_games"))) {
    redirect("/?error=unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let games: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const currentTenantId = await getActiveAdminTenantId();
      
      if (currentTenantId) {
        const { data, error } = await supabase.from('games').select('*, categories(name)').eq('tenant_id', currentTenantId).order('created_at', { ascending: false });
        if (!error && data) games = data;

        const { data: catData } = await supabase.from('categories').select('*').eq('tenant_id', currentTenantId).order('sort_order', { ascending: true });
        if (catData) categories = catData;
      }
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
