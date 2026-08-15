import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { RiwayatDepositClient } from "./RiwayatDepositClient";
import { getDictionary } from "@/lib/dictionary";
import { getUnifiedSession } from "@/lib/tenantAuth";

export default async function MemberDepositsHistoryPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();

  // Authenticate user
  const user = await getUnifiedSession(domain);

  if (!user) {
    redirect("/login");
  }

  const { data: tenantData } = await supabase
    .from('tenants')
    .select('theme_config')
    .eq('domain', domain)
    .maybeSingle();
  const language = tenantData?.theme_config?.language || 'id';
  const currency = tenantData?.theme_config?.currency || (tenantData?.theme_config?.language === 'ms' ? 'MYR' : 'IDR');

  const userEmail = (user.email || "").toLowerCase();
  const userPhoneRaw = (user.phone || "").replace(/[^0-9]/g, "");
  const userPhoneShort = userPhoneRaw.replace(/^(62|0)/, "");

  // Fetch all deposits
  const { data: allDeposits } = await supabase
    .from("deposits")
    .select("*")
    .order("created_at", { ascending: false });

  // Filter for this user
  let deposits = (allDeposits || []).filter((d) => {
    if (userEmail && d.customer_email && d.customer_email.toLowerCase() === userEmail) return true;
    
    const depWaRaw = (d.wa_number || "").replace(/[^0-9]/g, "");
    const depWaShort = depWaRaw.replace(/^(62|0)/, "");
    
    if (userPhoneShort && userPhoneShort.length >= 8 && depWaShort === userPhoneShort) return true;
    return false;
  });

  // Removed fallback dev logic to prevent data leaks for new users

  const dict = getDictionary(language);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{dict.user_deposits}</h2>
        <p className="text-gray-400 text-sm">{dict.member_dep_history_desc}</p>
      </div>

      <RiwayatDepositClient initialDeposits={deposits} language={language} currency={currency} />
    </div>
  );
}
