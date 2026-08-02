import { createClient } from "@/utils/supabase/server";
import { ProductsClient } from "./ProductsClient";

export default async function ProductsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let games: any[] = [];
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      
      // Fetch Products with joined Game info
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, games(id, name, image_url)')
        .order('created_at', { ascending: false });
        
      if (!productsError && productsData) products = productsData;

      // Fetch Games for the dropdown in the modal
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (!gamesError && gamesData) games = gamesData;
    }
  } catch (err) {
    console.error("Failed to fetch products/games", err);
  }

  return (
    <div className="space-y-6">
       <ProductsClient initialProducts={products} games={games} />
    </div>
  );
}
