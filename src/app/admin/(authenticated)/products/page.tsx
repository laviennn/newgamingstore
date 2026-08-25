import { Suspense } from "react";
import { checkPermission, getActiveAdminTenantId, getAdminSession } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { createClient } from "@/utils/supabase/server";
import { ProductsClient } from "./ProductsClient";
import { Currency } from "@/lib/currencyUtils";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const adminSession = await getAdminSession();
  const permissions: string[] = adminSession?.admin_roles?.permissions || [];
  
  if (!adminSession?.is_superadmin && !permissions.includes("manage_products")) {
    return <UnauthorizedAccess permission="manage_products" />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let games: any[] = [];
  let currency: Currency = 'IDR';
  let supportedCurrencies: Currency[] = ['IDR'];
  let multiCurrencyEnabled = false;
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const currentTenantId = await getActiveAdminTenantId();
      
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

        const { data: tenantData } = await supabase.from('tenants').select('theme_config').eq('id', currentTenantId).maybeSingle();
        if (tenantData?.theme_config) {
           const tLang = tenantData.theme_config.language || 'id';
           currency = (tenantData.theme_config.default_currency || tenantData.theme_config.currency || (tLang === 'ms' ? 'MYR' : 'IDR')) as Currency;
           multiCurrencyEnabled = !!tenantData.theme_config.multi_currency_enabled;
           supportedCurrencies = Array.isArray(tenantData.theme_config.supported_currencies) && tenantData.theme_config.supported_currencies.length > 0
             ? tenantData.theme_config.supported_currencies
             : [currency];
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch products/games", err);
  }

  return (
    <div className="space-y-6">
       <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Memuat katalog produk...</div>}>
         <ProductsClient 
           initialProducts={products} 
           games={games} 
           currency={currency} 
           supportedCurrencies={supportedCurrencies}
           multiCurrencyEnabled={multiCurrencyEnabled}
         />
       </Suspense>
    </div>
  );
}
