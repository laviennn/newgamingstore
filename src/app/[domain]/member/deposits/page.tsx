import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { RiwayatDepositClient } from "./RiwayatDepositClient";

export default async function MemberDepositsHistoryPage() {
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

  if (deposits.length === 0 && allDeposits && allDeposits.length > 0) {
    // fallback for dev/demo purposes if no exact match found
    deposits = allDeposits;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Riwayat Mutasi</h2>
        <p className="text-gray-400 text-sm">Pantau pergerakan saldo dan riwayat deposit akun Anda.</p>
      </div>

      <RiwayatDepositClient initialDeposits={deposits} />
    </div>
  );
}
