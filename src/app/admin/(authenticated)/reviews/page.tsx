import { Suspense } from "react";
import { checkPermission, getActiveAdminTenantId, getAdminSession } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { createClient } from "@/utils/supabase/server";
import { ReviewsClient } from "./ReviewsClient";

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const adminSession = await getAdminSession();
  const permissions: string[] = adminSession?.admin_roles?.permissions || [];
  
  if (!adminSession?.is_superadmin && !permissions.includes("manage_reviews")) {
    return <UnauthorizedAccess permission="manage_reviews" />;
  }

  let reviews: any[] = [];
  let games: any[] = [];
  let products: any[] = [];
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const currentTenantId = await getActiveAdminTenantId();
      
      if (currentTenantId) {
        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*, games(id, name), products(id, name)')
          .eq('tenant_id', currentTenantId)
          .order('created_at', { ascending: false });
          
        if (reviewsData) reviews = reviewsData;

        // Fetch Games for the dropdown in the modal
        const { data: gamesData } = await supabase
          .from('games')
          .select('id, name')
          .eq('tenant_id', currentTenantId)
          .order('name', { ascending: true });
          
        if (gamesData) games = gamesData;

        // Fetch Products for dropdown
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, game_id')
          .eq('tenant_id', currentTenantId)
          .order('name', { ascending: true });
          
        if (productsData) products = productsData;
      }
    }
  } catch (err) {
    console.error("Failed to fetch reviews", err);
  }

  return (
    <div className="space-y-6">
       <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Memuat reviews...</div>}>
         <ReviewsClient initialReviews={reviews} games={games} products={products} />
       </Suspense>
    </div>
  );
}
