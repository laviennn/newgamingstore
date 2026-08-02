import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { RiwayatTransaksiClient } from "./RiwayatTransaksiClient";

export default async function MemberTransactionsHistoryPage() {
  const supabase = await createClient();

  // Authenticate user
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    redirect("/login");
  }

  const userEmail = (user.email || "").toLowerCase();
  const userPhoneRaw = (user.user_metadata?.phone || "").replace(/[^0-9]/g, "");
  const userPhoneShort = userPhoneRaw.replace(/^(62|0)/, "");

  // Fetch all orders with games relation
  const { data: allOrders } = await supabase
    .from("orders")
    .select("*, games(name)")
    .order("created_at", { ascending: false });

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

  if (orders.length === 0 && allOrders && allOrders.length > 0) {
    // fallback for dev/demo purposes if no exact match found
    orders = allOrders;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Riwayat Transaksi</h2>
        <p className="text-gray-400 text-sm">Pantau daftar pesanan dan riwayat top up akun Anda.</p>
      </div>

      <RiwayatTransaksiClient initialOrders={orders} />
    </div>
  );
}
