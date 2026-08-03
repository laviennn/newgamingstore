import { checkPermission } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ProductsClient } from "./ProductsClient";

export default async function ProductsPage() {
  if (!(await checkPermission("manage_products"))) {
    redirect("/?error=unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let games: any[] = [];
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const cookieStore = await cookies();
      const currentTenantId = cookieStore.get('admin_tenant_id')?.value;
      
      if (currentTenantId) {
        // Fetch Products with joined Game info
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, games(id, name, image_url)')
          .eq('tenant_id', currentTenantId)
          .order('created_at', { ascending: false });
          
        if (!productsError && productsData) products = productsData;

        // Fetch Games for the dropdown in the modal
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('id, name')
          .eq('tenant_id', currentTenantId)
          .order('name', { ascending: true });
          
        if (!gamesError && gamesData) games = gamesData;
      }
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
