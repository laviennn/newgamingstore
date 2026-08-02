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
  
  const { data: deposit, error } = await supabase
    .from('deposits')
    .select(`
      *,
      payment_channels (name, category, account_number, account_name, qr_image_url)
    `)
    .eq('invoice_id', id)
    .single();

  if (error || !deposit) {
    console.error("Error fetching deposit:", error);
    return notFound();
  }

  // Fetch tenant config for WA number
  let { data: tenantData } = await supabase
    .from('tenants')
    .select('theme_config')
    .eq('domain', domain)
    .maybeSingle();

  if (!tenantData) {
    const res = await supabase.from('tenants').select('theme_config').limit(1).maybeSingle();
    tenantData = res.data;
  }

  const tenantConfig = tenantData?.theme_config || { siteName: "NewGamingStore" };

  return (
    <DepositCheckoutClient deposit={deposit} tenantConfig={tenantConfig} />
  );
}
