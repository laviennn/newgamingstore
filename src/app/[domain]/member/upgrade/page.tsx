import { redirect } from "next/navigation";
import { UpgradeClient } from "./UpgradeClient";
import { getUnifiedSession } from "@/lib/tenantAuth";
import { createClient } from "@/utils/supabase/server";

export default async function MemberUpgradePage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();

  // 1. Authenticate via unified session (email OR username mode)
  const user = await getUnifiedSession(domain);
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Tenant Config and ID for filtering
  let { data: tenantData } = await supabase
    .from("tenants")
    .select("id, theme_config")
    .eq("domain", domain)
    .maybeSingle();

  if (!tenantData) {
    const res = await supabase.from("tenants").select("id, theme_config").limit(1).maybeSingle();
    tenantData = res.data;
  }
  
  if (!tenantData) {
     redirect("/");
  }

  const tenantConfig = tenantData?.theme_config || {};
  const tenantId = tenantData.id;

  // 3. Fetch Active Membership Packages
  const { data: dynamicPackages } = await supabase
    .from("membership_packages")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("price", { ascending: true });

  // 4. Fetch Active Payment Channels
  const { data: paymentChannels } = await supabase
    .from("payment_channels")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // 5. Current level already resolved by getUnifiedSession
  const currentLevel = user.level || "MEMBER";

  return (
    <UpgradeClient
      user={user}
      currentLevel={currentLevel}
      dynamicPackages={dynamicPackages || []}
      paymentChannels={paymentChannels || []}
      tenantConfig={tenantConfig}
      tenantId={tenantId}
      language={tenantConfig.language || 'id'}
      currency={tenantConfig.currency || (tenantConfig.language === 'ms' ? 'MYR' : 'IDR')}
    />
  );
}
