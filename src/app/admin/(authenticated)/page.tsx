import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, ShoppingCart, DollarSign } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

import { cookies } from "next/headers";

export default async function AdminDashboardPage() {
  let stats = { tenants: 0, games: 0, products: 0, orders: 0 };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentOrders: any[] = [];
  let isConnected = false;

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const cookieStore = await cookies();
      const currentTenantId = cookieStore.get('admin_tenant_id')?.value;
      
      // We need a tenant id to filter
      if (currentTenantId) {
        // Fetch aggregates (In a real app, use count queries. Using select with count for simplicity in MVP)
        const { count: tenantCount } = await supabase.from('tenants').select('*', { count: 'exact', head: true });
        const { count: gameCount } = await supabase.from('games').select('*', { count: 'exact', head: true }).eq('tenant_id', currentTenantId);
        const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('tenant_id', currentTenantId);
        const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('tenant_id', currentTenantId);
        
        stats = { 
          tenants: tenantCount || 0, 
          games: gameCount || 0, 
          products: productCount || 0, 
          orders: orderCount || 0 
        };

        // Fetch recent orders
        const { data } = await supabase.from('orders').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: false }).limit(5);
        if (data) recentOrders = data;
      }

      
      isConnected = true;
    }
  } catch (err) {
    console.error("Supabase connect error", err);
  }

  // Fallback if no DB connected
  if (!isConnected) {
    stats = { tenants: 14, games: 24, products: 45, orders: 1234 };
    recentOrders = [1, 2, 3, 4, 5].map((i) => ({ id: `INV-20260${i}`, customer_email: `user${i}@example.com`, total_price: i * 24000 }));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      
      {!isConnected && (
         <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl text-sm mb-4 border border-yellow-200">
            <strong>Note:</strong> Supabase is not connected yet. Displaying mock data. Please configure your .env variables.
         </div>
      )}

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tenants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.games}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-8">
               {recentOrders.length === 0 ? (
                 <p className="text-sm text-muted-foreground">No recent orders.</p>
               ) : (
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 recentOrders.map((o: any) => (
                   <div key={o.id} className="flex items-center">
                     <div className="ml-4 space-y-1">
                       <p className="text-sm font-medium leading-none">Order {o.id.substring(0, 8)}</p>
                       <p className="text-sm text-muted-foreground">{o.customer_email}</p>
                     </div>
                     <div className="ml-auto font-medium">Rp {Number(o.total_price).toLocaleString('id-ID')}</div>
                   </div>
                 ))
               )}
             </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-sm text-muted-foreground text-center py-12">
               {isConnected ? 'Connected to Supabase.' : 'Awaiting Supabase Connection.'}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
