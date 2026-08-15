import { createClient } from "@/utils/supabase/server";
import { DepositCheckoutClient } from "./DepositCheckoutClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DepositCheckoutPage({
  params,
}: {
  params: Promise<{ domain: string, id: string }>;
}) {
  const { domain, id } = await params;
  const supabase = await createClient();
  
  // Fetch tenant config for WA number
  let { data: tenantData } = await supabase
    .from('tenants')
    .select('id, theme_config')
    .eq('domain', domain)
    .maybeSingle();

  if (!tenantData) {
    const res = await supabase.from('tenants').select('id, theme_config').limit(1).maybeSingle();
    tenantData = res.data;
  }
  
  if (!tenantData) {
     return notFound();
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase
    .from('deposits')
    .select(`
      *,
      payment_channels (name, category, account_number, account_name, qr_image_url)
    `)
    .eq('tenant_id', tenantData.id);

  if (isUUID) {
    query = query.or(`id.eq.${id},invoice_id.eq.${id}`);
  } else {
    query = query.eq('invoice_id', id);
  }

  const { data: deposit, error } = await query.maybeSingle();

  if (error || !deposit) {
    console.error("Error fetching deposit:", error);
    return notFound();
  }

  const tenantConfig = tenantData?.theme_config || { siteName: "NewGamingStore" };

  return (
    <DepositCheckoutClient deposit={deposit} tenantConfig={tenantConfig} />
  );
}
