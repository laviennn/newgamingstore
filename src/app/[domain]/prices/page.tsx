import { createClient } from "@/utils/supabase/server";
import { PricesClient } from "./PricesClient";
import { getTenantAuthConfig } from "@/lib/tenantAuth";
import { Currency } from "@/lib/currencyUtils";

export const revalidate = 3600; // 1-hour ISR cache on Edge CDN

export default async function PriceListPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const tenantConfig = await getTenantAuthConfig(domain);
  const language = tenantConfig?.language || 'id';
  const currency: Currency = (tenantConfig?.currency as Currency) || (language === 'ms' ? 'MYR' : 'IDR');

  let products: any[] = [];
  let games: any[] = [];

  try {
    const supabase = await createClient();
    
    // 1. Resolve Tenant ID
    const targetDomain = domain === 'demo.localhost' ? 'localhost' : domain;
    let { data: tenantData } = await supabase
      .from('tenants')
      .select('id, theme_config')
      .or(`domain.eq.${targetDomain},admin_domain.eq.${targetDomain}`)
      .maybeSingle();

    if (!tenantData && targetDomain.includes('localhost')) {
      const { data: localTenant } = await supabase
        .from('tenants')
        .select('id, theme_config')
        .eq('domain', 'localhost')
        .maybeSingle();
      if (localTenant) tenantData = localTenant;
    }

    if (!tenantData) {
      const res = await supabase
        .from('tenants')
        .select('id, theme_config')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      tenantData = res.data;
    }

    const tenantId = tenantData?.id;

    if (tenantId) {
      // 2. Fetch all active games strictly for this tenant
      const { data: gamesData } = await supabase
        .from('games')
        .select('id, name, slug, image_url')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true });
      
      if (gamesData) games = gamesData;

      // 3. Fetch all active products strictly for this tenant
      const { data: productsData } = await supabase
        .from('products')
        .select('*, games!inner(id, name, tenant_id)')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .order('price', { ascending: true });

      if (productsData) products = productsData;
    }
  } catch (error) {
    console.error("Failed to fetch price list data:", error);
  }

  return (
    <div className="min-h-screen bg-theme-background text-white">
      <PricesClient initialGames={games} initialProducts={products} language={language} currency={currency} />
    </div>
  );
}
