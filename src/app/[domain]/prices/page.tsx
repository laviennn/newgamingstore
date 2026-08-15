import { createClient } from "@/utils/supabase/server";
import { PricesClient } from "./PricesClient";
import { getTenantAuthConfig } from "@/lib/tenantAuth";

export const dynamic = "force-dynamic";

export default async function PriceListPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const tenantConfig = await getTenantAuthConfig(domain);
  const language = tenantConfig?.language || 'id';

  let products: any[] = [];
  let games: any[] = [];

  try {
    const supabase = await createClient();
    
    // Fetch all active games
    const { data: gamesData } = await supabase
      .from('games')
      .select('id, name, slug, image_url')
      .order('name', { ascending: true });
    
    if (gamesData) games = gamesData;

    // Fetch all active products with game info
    const { data: productsData } = await supabase
      .from('products')
      .select('*, games(id, name)')
      .eq('active', true)
      .order('price', { ascending: true });

    if (productsData) products = productsData;
  } catch (error) {
    console.error("Failed to fetch price list data:", error);
  }

  return (
    <div className="min-h-screen bg-theme-background text-white">
      <PricesClient initialGames={games} initialProducts={products} language={language} />
    </div>
  );
}
