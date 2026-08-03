import { checkPermission } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { OrderListClient } from "./OrderListClient";

export default async function OrdersPage() {
  if (!(await checkPermission("manage_orders"))) {
    redirect("/?error=unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = [];
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const cookieStore = await cookies();
      const currentTenantId = cookieStore.get('admin_tenant_id')?.value;
      
      if (currentTenantId) {
        const { data, error } = await supabase
          .from('orders')
          .select('*, games(name), products(name)')
          .eq('tenant_id', currentTenantId)
          .order('created_at', { ascending: false });
        
        if (!error && data) orders = data;
      }
    }
  } catch {}

  if (orders.length === 0) {
    orders = [
      { 
        id: "INV-1001-MOCK", 
        games: { name: "Mobile Legends" }, 
        products: { name: "86 Diamonds" }, 
        status: "Pending", 
        total_price: 24000, 
        created_at: new Date().toISOString() 
      }
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderListClient initialOrders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
