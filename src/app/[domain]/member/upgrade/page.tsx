import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UpgradeClient } from "./UpgradeClient";

export default async function MemberUpgradePage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Active Membership Packages
  const { data: dynamicPackages } = await supabase
    .from("membership_packages")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  // 3. Fetch Active Payment Channels
  const { data: paymentChannels } = await supabase
    .from("payment_channels")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // 4. Fetch Tenant Config for CS WhatsApp
  const { data: tenantData } = await supabase
    .from("tenants")
    .select("theme_config")
    .eq("domain", domain)
    .maybeSingle();

  const tenantConfig = tenantData?.theme_config || {};

  return (
    <UpgradeClient
      user={user}
      dynamicPackages={dynamicPackages || []}
      paymentChannels={paymentChannels || []}
      tenantConfig={tenantConfig}
    />
  );
}
