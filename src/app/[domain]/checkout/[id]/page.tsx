import { createClient } from "@/utils/supabase/server";
import { CheckoutClient } from "./CheckoutClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      games (name, image_url),
      products (name),
      payment_channels (name, category, account_number, account_name, qr_image_url)
    `)
    .eq('invoice_id', id)
    .single();

  if (error || !order) {
    console.error("Error fetching order:", error);
    if (error?.code === '42P01') {
       console.warn("Table orders doesn't exist, serving mock order for invoice: ", id);
       return <CheckoutClient order={{
         invoice_id: id,
         created_at: new Date().toISOString(),
         status: 'PENDING',
         payment_status: 'UNPAID',
         account_data: { "User ID": "854016571", "Server": "os_asia", "Username": "L*****n" },
         original_price: 558153,
         total_price: 562060,
         fee: 3907,
         discount_amount: 0,
         games: { name: "Genshin Impact", image_url: "https://placehold.co/150x200/2563eb/white?text=Genshin" },
         products: { name: "Genshin Impact 1980+260 Genesis Crystals (ID)" },
         payment_channels: { name: "QRIS (All Payment Method)" }
       }} tenantConfig={{ siteName: "NewGamingStore" }} />;
    }
    return notFound();
  }

  return (
    <CheckoutClient order={order} tenantConfig={{ siteName: "NewGamingStore" }} />
  );
}
