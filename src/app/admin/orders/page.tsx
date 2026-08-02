import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { OrderListClient } from "./OrderListClient";

export default async function OrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = [];
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, games(name), products(name)')
        .order('created_at', { ascending: false });
        
      if (!error && data) orders = data;
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
