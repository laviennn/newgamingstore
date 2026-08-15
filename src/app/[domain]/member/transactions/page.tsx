import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { RiwayatTransaksiClient } from "./RiwayatTransaksiClient";
import { getDictionary } from "@/lib/dictionary";
import { getUnifiedSession } from "@/lib/tenantAuth";

export default async function MemberTransactionsHistoryPage({
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

  // Fetch Tenant Data & Config
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
  const language = tenantData?.theme_config?.language || 'id';
  const currency = tenantData?.theme_config?.currency || (tenantData?.theme_config?.language === 'ms' ? 'MYR' : 'IDR');

  const userEmail = (user.email || "").toLowerCase();
  const userPhoneRaw = (user.phone || "").replace(/[^0-9]/g, "");
  const userPhoneShort = userPhoneRaw.replace(/^(62|0)/, "");

  // Fetch all orders strictly for this tenant
  let ordersQuery = supabase
    .from("orders")
    .select("*, games(name)")
    .order("created_at", { ascending: false });

  if (tenantId) {
    ordersQuery = ordersQuery.eq('tenant_id', tenantId);
  }

  const { data: allOrders } = await ordersQuery;

  // Filter for this user
  let orders = (allOrders || []).filter((o) => {
    // Direct Email Match
    if (userEmail && o.customer_email && o.customer_email.toLowerCase() === userEmail) {
      return true;
    }
    
    // Phone Match (on wa_number or customer_email)
    const orderWaRaw = (o.wa_number || "").replace(/[^0-9]/g, "");
    const orderWaShort = orderWaRaw.replace(/^(62|0)/, "");

    const orderEmailRaw = (o.customer_email || "").replace(/[^0-9]/g, "");
    const orderEmailShort = orderEmailRaw.replace(/^(62|0)/, "");

    if (userPhoneShort && userPhoneShort.length >= 8) {
      if (
        (orderWaShort && (orderWaShort === userPhoneShort || orderWaRaw === userPhoneRaw)) ||
        (orderEmailShort && (orderEmailShort === userPhoneShort || orderEmailRaw === userPhoneRaw))
      ) {
        return true;
      }
    }

    return false;
  });

  // Removed fallback dev logic to prevent data leaks for new users

  const dict = getDictionary(language);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{dict.user_transactions}</h2>
        <p className="text-gray-400 text-sm">{dict.member_trx_desc}</p>
      </div>

      <RiwayatTransaksiClient initialOrders={orders} language={language} currency={currency} />
    </div>
  );
}
