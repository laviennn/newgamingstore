import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  BadgeCheck, 
  Wallet, 
  Settings, 
  ArrowRight, 
  BarChart3, 
  Mail, 
  Calendar, 
  Phone 
} from "lucide-react";

export default async function MemberDashboardPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Tenant Config for WA Channel setting
  let waChannelActive = false;
  let waChannelUrl = "";

  const { data: tenantData } = await supabase
    .from("tenants")
    .select("theme_config")
    .eq("domain", domain)
    .maybeSingle();

  if (tenantData?.theme_config) {
    waChannelActive = tenantData.theme_config.waChannelActive ?? false;
    waChannelUrl = tenantData.theme_config.waChannelUrl || "#";
  }

  // 3. Fetch User's Orders & Deposits from DB
  const { data: allOrders } = await supabase
    .from("orders")
    .select("*, games(name)")
    .order("created_at", { ascending: false });

  const { data: allDeposits } = await supabase
    .from("deposits")
    .select("*")
    .order("created_at", { ascending: false });

  // 4. Fetch Wallet Balance
  const userEmail = (user.email || "").toLowerCase();
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("email", userEmail)
    .maybeSingle();

  const currentBalance = wallet?.balance || 0;
  const userPhoneRaw = (user.user_metadata?.phone || "").replace(/[^0-9]/g, "");
  const userPhoneShort = userPhoneRaw.replace(/^(62|0)/, "");

  let orders = (allOrders || []).filter((o) => {
    // 1. Direct Email Match
    if (userEmail && o.customer_email && o.customer_email.toLowerCase() === userEmail) {
      return true;
    }
    
    // 2. Phone Match (on wa_number or customer_email)
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

  // Fallback for dev / guest orders: If no order matched email/phone specifically, show recent orders
  if (orders.length === 0 && allOrders && allOrders.length > 0) {
    orders = allOrders;
  }

  // Filter Deposits
  let deposits = (allDeposits || []).filter((d) => {
    if (userEmail && d.customer_email && d.customer_email.toLowerCase() === userEmail) return true;
    
    const depWaRaw = (d.wa_number || "").replace(/[^0-9]/g, "");
    const depWaShort = depWaRaw.replace(/^(62|0)/, "");
    
    if (userPhoneShort && userPhoneShort.length >= 8 && depWaShort === userPhoneShort) return true;
    return false;
  });

  if (deposits.length === 0 && allDeposits && allDeposits.length > 0) {
    deposits = allDeposits; // fallback dev
  }

  // Merge & Sort History
  const mergedHistory = [...orders, ...deposits].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calculate statistics
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const processCount = orders.filter((o) => o.status === "Processed").length;
  const successCount = orders.filter((o) => o.status === "Success").length;
  const failedCount = orders.filter((o) => o.status === "Failed").length;
  
  const totalTransactions = orders.length;
  const totalSpent = orders
    .filter((o) => o.status === "Success" || o.status === "Pending")
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  // User metadata
  const name = user.user_metadata?.name || "Member";
  const phone = user.user_metadata?.phone || "-";
  const createdAtFormatted = new Date(user.created_at).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      
      {/* 1. Banner Upgrade Level */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            Tingkatkan <span className="text-blue-500">Level Membership Anda</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Anda saat ini berada di Level <strong className="text-white uppercase">MEMBER</strong>. Upgrade sekarang!
          </p>
        </div>
        <Link
          href="/member/upgrade"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-900/20 shrink-0"
        >
          <span>Upgrade Membership</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. Banner WA Channel (Admin Configurable) */}
      {waChannelActive && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-[#0d2818] to-emerald-950/80 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 fill-emerald-400" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gabung Channel WhatsApp</h3>
              <p className="text-gray-300 text-sm">
                Dapatkan info promo, kode voucher, dan update terbaru langsung di WhatsApp.
              </p>
            </div>
          </div>
          <a
            href={waChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 rounded-full transition-all text-sm shrink-0 text-center shadow-lg shadow-emerald-950/40"
          >
            Gabung Sekarang
          </a>
        </div>
      )}

      {/* 3. Cards Section: Member ID & Dompet Anda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Member ID Card */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 tracking-wider">MEMBER ID</span>
                <span className="bg-white/10 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                  MEMBER
                </span>
              </div>
              <Link href="/member/profile" className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors">
                <Settings className="w-3.5 h-3.5" />
                <span>Atur Profil</span>
              </Link>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-cyan-500 text-black text-2xl font-black flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{name}</h3>
                  <BadgeCheck className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member sejak: {createdAtFormatted}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-gray-200">{phone}</span>
          </div>
        </div>

        {/* Dompet Anda Card */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">Dompet Anda</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </button>
                <Link
                  href="/member/deposit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition-colors shadow-md shadow-blue-900/20"
                >
                  Deposit
                </Link>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs font-bold text-gray-400 tracking-wider">SALDO AKUN</span>
              <div className="text-3xl font-black text-white mt-1">
                <span className="text-gray-400 font-bold text-xl mr-1">Rp</span> {currentBalance.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Statistik Transaksi Hari Ini */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Statistik Transaksi Hari Ini</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-amber-500 mb-1">{pendingCount}</div>
            <div className="text-xs font-bold tracking-wider text-amber-500 uppercase">MENUNGGU</div>
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-blue-500 mb-1">{processCount}</div>
            <div className="text-xs font-bold tracking-wider text-blue-500 uppercase">DALAM PROSES</div>
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-emerald-500 mb-1">{successCount}</div>
            <div className="text-xs font-bold tracking-wider text-emerald-500 uppercase">SUKSES</div>
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-rose-500 mb-1">{failedCount}</div>
            <div className="text-xs font-bold tracking-wider text-rose-500 uppercase">GAGAL</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-xl font-black text-white">{totalTransactions}</div>
            <div className="text-xs font-medium text-gray-400 mt-0.5">Total Transaksi</div>
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-xl font-black text-white">
              Rp {totalSpent.toLocaleString("id-ID")}
            </div>
            <div className="text-xs font-medium text-gray-400 mt-0.5">Total Penjualan</div>
          </div>
        </div>
      </div>

      {/* 5. Riwayat Transaksi Terbaru Table */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Riwayat Transaksi Terbaru</h3>

        {mergedHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Belum ada riwayat transaksi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">NOMOR INVOICE</th>
                  <th className="py-3 px-4">ITEM</th>
                  <th className="py-3 px-4">TARGET</th>
                  <th className="py-3 px-4">HARGA</th>
                  <th className="py-3 px-4">TANGGAL</th>
                  <th className="py-3 px-4 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {mergedHistory.slice(0, 5).map((item) => {
                  const isDeposit = item.invoice_id?.startsWith('DEP');
                  
                  const targetFormatted = isDeposit ? '-' : (item.form_data
                    ? Object.values(item.form_data).join(" ")
                    : "-");
                    
                  const itemName = isDeposit ? "Deposit Saldo" : (item.games?.name ? `${item.games.name} Item` : "Top Up Service");
                  const price = isDeposit ? item.amount : item.total_price;
                  const orderDate = new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-semibold text-blue-400">
                        {item.invoice_id || item.transaction_id || item.id.substring(0, 10)}
                      </td>
                      <td className="py-4 px-4 text-gray-200">
                        {itemName}
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">{targetFormatted}</td>
                      <td className="py-4 px-4 font-bold text-white">
                        Rp {Number(price).toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">{orderDate}</td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-xs font-extrabold uppercase border ${
                            item.status === "Success"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : item.status === "Pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : item.status === "Processed"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
