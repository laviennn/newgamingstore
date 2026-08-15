import { checkPermission, getActiveAdminTenantId, getAdminSession } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { createClient } from "@/utils/supabase/server";
import { AdminDepositsClient } from "./AdminDepositsClient";
import { Currency } from "@/lib/currencyUtils";

export const dynamic = 'force-dynamic';

export default async function AdminDepositsPage() {
  const adminSession = await getAdminSession();
  const permissions: string[] = adminSession?.admin_roles?.permissions || [];
  
  if (!adminSession?.is_superadmin && !permissions.includes("manage_deposits")) {
    return <UnauthorizedAccess permission="manage_deposits" />;
  }

  const supabase = await createClient();
  const currentTenantId = await getActiveAdminTenantId();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let deposits: any[] = [];
  let currency: Currency = 'IDR';
  
  if (currentTenantId) {
    const { data, error } = await supabase
      .from("deposits")
      .select("*, payment_channels(name)")
      .eq("tenant_id", currentTenantId)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching deposits:", error);
    } else if (data) {
      deposits = data;
    }

    const { data: tenantData } = await supabase.from('tenants').select('theme_config').eq('id', currentTenantId).single();
    if (tenantData?.theme_config) {
       const tLang = tenantData.theme_config.language || 'id';
       currency = (tenantData.theme_config.currency || (tLang === 'ms' ? 'MYR' : 'IDR')) as Currency;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Deposit Permohonan</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
              currency === 'MYR' 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            }`}>
              <span className="text-sm leading-none">{currency === 'MYR' ? '🇲🇾' : '🇮🇩'}</span>
              <span>{currency === 'MYR' ? 'MYR (RM)' : 'IDR (Rp)'}</span>
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            Kelola semua permohonan deposit saldo ({currency === 'MYR' ? 'Ringgit Malaysia - RM' : 'Rupiah Indonesia - Rp'}) dari member.
          </p>
        </div>
      </div>
      <AdminDepositsClient initialDeposits={deposits || []} currency={currency} />
    </div>
  );
}
