import { checkPermission } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { getPromoCodes } from "./actions";
import { PromosClient } from "./PromosClient";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  if (!(await checkPermission("manage_promos"))) {
    return <UnauthorizedAccess permission="manage_promos" />;
  }

  const promos = await getPromoCodes();
  
  const currentTenantId = await getActiveAdminTenantId();
  const supabase = await createClient();
  let currency = 'IDR';
  if (currentTenantId) {
    const { data: tenantData } = await supabase.from('tenants').select('theme_config').eq('id', currentTenantId).single();
    if (tenantData?.theme_config) {
      const tLang = tenantData.theme_config.language || 'id';
      currency = tenantData.theme_config.currency || (tLang === 'ms' ? 'MYR' : 'IDR');
    }
  }
  
  return <PromosClient initialPromos={promos} currency={currency as any} />;
}
