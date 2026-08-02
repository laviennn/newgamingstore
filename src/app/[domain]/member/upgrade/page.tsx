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

  // 5. Determine current level from metadata overrides
  let currentLevel = user.user_metadata?.level || "MEMBER";
  const userEmail = (user.email || "").toLowerCase();
  
  const { data: upgradeHistory } = await supabase
    .from("deposits")
    .select("metadata")
    .eq("customer_email", userEmail)
    .eq("status", "Success")
    .order("created_at", { ascending: false });

  if (upgradeHistory && upgradeHistory.length > 0) {
    const latestUpgrade = upgradeHistory.find(d => d.metadata && d.metadata.type === "UPGRADE");
    if (latestUpgrade && latestUpgrade.metadata.package_name) {
      currentLevel = latestUpgrade.metadata.package_name;
    }
  }

  return (
    <UpgradeClient
      user={user}
      currentLevel={currentLevel}
      dynamicPackages={dynamicPackages || []}
      paymentChannels={paymentChannels || []}
      tenantConfig={tenantConfig}
    />
  );
}
