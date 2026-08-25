import { checkPermission, getActiveAdminTenantId } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { OrderListClient } from "./OrderListClient";
import { Currency } from "@/lib/currencyUtils";
import { getAdminSession } from "@/app/admin/actions";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const adminSession = await getAdminSession();
  const permissions: string[] = adminSession?.admin_roles?.permissions || [];
  
  if (!adminSession?.is_superadmin && !permissions.includes("manage_orders")) {
    return <UnauthorizedAccess permission="manage_orders" />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = [];
  let currency: Currency = 'IDR';
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const currentTenantId = await getActiveAdminTenantId();
      
      if (currentTenantId) {
        const { data, error } = await supabase
          .from('orders')
          .select('*, games(name), products(name, names), payment_channels(name, category, account_number, account_name, logo_url, qr_image_url)')
          .eq('tenant_id', currentTenantId)
          .order('created_at', { ascending: false });
        
        if (!error && data) orders = data;

        const { data: tenantData } = await supabase.from('tenants').select('theme_config').eq('id', currentTenantId).maybeSingle();
        if (tenantData?.theme_config) {
           const tLang = tenantData.theme_config.language || 'id';
           currency = (tenantData.theme_config.currency || (tLang === 'ms' ? 'MYR' : 'IDR')) as Currency;
        }
      }
    }
  } catch {}

  if (orders.length === 0) {
    orders = [
      { 
        id: "INV-1001-MOCK", 
        games: { name: "Mobile Legends" }, 
        products: { name: "86 Diamonds" }, 
        payment_channels: { name: "BCA Transfer", category: "Bank Transfer", account_number: "8720192831", account_name: "PT Yowana Store" },
        status: "Pending", 
        total_price: 24000, 
        created_at: new Date().toISOString() 
      }
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
              currency === 'MYR' 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            }`}>
              <span className="text-sm leading-none">{currency === 'MYR' ? '🇲🇾' : '🇮🇩'}</span>
              <span>{currency === 'MYR' ? 'MYR (RM)' : 'IDR (Rp)'}</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola dan pantau seluruh transaksi ({currency === 'MYR' ? 'Ringgit Malaysia - RM' : 'Rupiah Indonesia - Rp'}) pesanan pelanggan.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderListClient initialOrders={orders} currency={currency} />
        </CardContent>
      </Card>
    </div>
  );
}
