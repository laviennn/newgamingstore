import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Gamepad2, 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  DollarSign
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getActiveAdminTenantId } from "@/app/admin/actions";
import Link from "next/link";
import { formatCurrency } from "@/lib/currencyUtils";

export default async function AdminDashboardPage() {
  let stats = {
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    paidVolumeByCurrency: {} as Record<string, number>,
    pendingVolumeByCurrency: {} as Record<string, number>,
    members: 0,
    games: 0,
    products: 0,
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentOrders: any[] = [];
  let isConnected = false;
  let currency: any = "IDR";

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const currentTenantId = await getActiveAdminTenantId();
      
      if (currentTenantId) {
        const [
          gamesRes,
          productsRes,
          membersRes,
          ordersTotalRes,
          ordersPaidRes,
          ordersPendingRes,
          paidPricesRes,
          pendingPricesRes,
          recentOrdersRes,
          tenantConfigRes,
        ] = await Promise.all([
          supabase.from('games').select('*', { count: 'exact', head: true }).eq('tenant_id', currentTenantId),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('tenant_id', currentTenantId),
          supabase.from('members').select('*', { count: 'exact', head: true }).eq('tenant_id', currentTenantId),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('tenant_id', currentTenantId),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('tenant_id', currentTenantId).eq('payment_status', 'PAID'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('tenant_id', currentTenantId).in('payment_status', ['PENDING', 'UNPAID']),
          supabase.from('orders').select('total_price, currency').eq('tenant_id', currentTenantId).eq('payment_status', 'PAID'),
          supabase.from('orders').select('total_price, currency').eq('tenant_id', currentTenantId).in('payment_status', ['PENDING', 'UNPAID']),
          supabase.from('orders').select('*, games(name), products(name), payment_channels(name, category)').eq('tenant_id', currentTenantId).order('created_at', { ascending: false }).limit(6),
          supabase.from('tenants').select('theme_config').eq('id', currentTenantId).single(),
        ]);

        const paidSumByCurrency: Record<string, number> = {};
        if (paidPricesRes.data) {
          paidPricesRes.data.forEach(item => {
            const curr = item.currency || tenantConfigRes.data?.theme_config?.currency || (tenantConfigRes.data?.theme_config?.language === 'ms' ? 'MYR' : 'IDR');
            paidSumByCurrency[curr] = (paidSumByCurrency[curr] || 0) + (Number(item.total_price) || 0);
          });
        }
        
        const pendingSumByCurrency: Record<string, number> = {};
        if (pendingPricesRes.data) {
          pendingPricesRes.data.forEach(item => {
            const curr = item.currency || tenantConfigRes.data?.theme_config?.currency || (tenantConfigRes.data?.theme_config?.language === 'ms' ? 'MYR' : 'IDR');
            pendingSumByCurrency[curr] = (pendingSumByCurrency[curr] || 0) + (Number(item.total_price) || 0);
          });
        }

        stats = {
          totalOrders: ordersTotalRes.count || 0,
          paidOrders: ordersPaidRes.count || 0,
          pendingOrders: ordersPendingRes.count || 0,
          paidVolumeByCurrency: paidSumByCurrency,
          pendingVolumeByCurrency: pendingSumByCurrency,
          members: membersRes.count || 0,
          games: gamesRes.count || 0,
          products: productsRes.count || 0,
        };

        if (recentOrdersRes.data) {
          recentOrders = recentOrdersRes.data;
        }
        
        currency = tenantConfigRes.data?.theme_config?.currency || (tenantConfigRes.data?.theme_config?.language === 'ms' ? 'MYR' : 'IDR');

        isConnected = true;
      }
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }

  const rawCurrencies = Array.from(
    new Set([
      ...Object.keys(stats.paidVolumeByCurrency),
      ...Object.keys(stats.pendingVolumeByCurrency),
      currency
    ])
  ).filter(Boolean);

  const activeCurrenciesWithData = rawCurrencies.filter(
    (c) => (stats.paidVolumeByCurrency[c] || 0) > 0 || (stats.pendingVolumeByCurrency[c] || 0) > 0
  );

  const displayCurrencies = activeCurrenciesWithData.length > 1 
    ? activeCurrenciesWithData 
    : (rawCurrencies.length > 1 && (stats.paidOrders > 0 || stats.pendingOrders > 0))
    ? rawCurrencies
    : [currency];

  const isHeterogeneous = displayCurrencies.length > 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan omset transaksi, pesanan, member, dan katalog toko Anda.
          </p>
        </div>
        <Link 
          href="/admin/orders" 
          className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" /> Kelola Pesanan <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {!isConnected && (
        <div className="bg-yellow-500/10 text-yellow-500 p-4 rounded-xl text-sm border border-yellow-500/20">
          <strong>Catatan:</strong> Supabase belum terhubung. Menampilkan data statistik default.
        </div>
      )}

      {/* Financial Overview (Heterogeneous vs Single Currency) */}
      {isHeterogeneous ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/40 border border-border/60 rounded-2xl p-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">Ringkasan Keuangan Multi-Mata Uang</h2>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Heterogen ({displayCurrencies.join(" & ")})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Terdeteksi transaksi dalam berbagai mata uang. Data dipisahkan per negara untuk akurasi pembukuan.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {displayCurrencies.map((curr) => {
              const isMYR = curr === "MYR";
              const flag = isMYR ? "🇲🇾" : "🇮🇩";
              const countryName = isMYR ? "Toko Malaysia" : "Toko Indonesia";
              const currencySubtitle = isMYR ? "Mata Uang: Ringgit (MYR)" : "Mata Uang: Rupiah (IDR)";
              const paidAmount = stats.paidVolumeByCurrency[curr] || 0;
              const pendingAmount = stats.pendingVolumeByCurrency[curr] || 0;

              return (
                <Card 
                  key={curr} 
                  className={`relative overflow-hidden border shadow-sm ${
                    isMYR 
                      ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-card' 
                      : 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-card'
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl drop-shadow-sm">{flag}</span>
                      <div>
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                          {countryName}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-medium">{currencySubtitle}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                      isMYR 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    }`}>
                      {curr}
                    </span>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-2 gap-4">
                    {/* Paid Omset */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Total Omset (PAID)</span>
                      </div>
                      <div className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                        {formatCurrency(paidAmount, curr as any)}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Berhasil terverifikasi</p>
                    </div>

                    {/* Pending Omset */}
                    <div className="space-y-1 border-l border-border/40 pl-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                        <Clock className="w-4 h-4" />
                        <span>Total Pending</span>
                      </div>
                      <div className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                        {formatCurrency(pendingAmount, curr as any)}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Menunggu pembayaran</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-500 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Total Omset Lunas (PAID)
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                  <span>{currency === 'MYR' ? '🇲🇾' : '🇮🇩'}</span>
                  <span>{currency === 'MYR' ? 'MYR' : 'IDR'}</span>
                </span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {formatCurrency(stats.paidVolumeByCurrency[currency] || 0, currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Akumulasi nilai transaksi yang telah berhasil dibayar.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-amber-500 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Total Nominal Pending
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                  <span>{currency === 'MYR' ? '🇲🇾' : '🇮🇩'}</span>
                  <span>{currency === 'MYR' ? 'MYR' : 'IDR'}</span>
                </span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {formatCurrency(stats.pendingVolumeByCurrency[currency] || 0, currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Nilai transaksi yang masih menunggu konfirmasi / pembayaran.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Operational Metrics (Orders & Users) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders */}
        <Link href="/admin/orders" className="block group">
          <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Semua pesanan <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Paid Orders */}
        <Link href="/admin/orders" className="block group">
          <Card className="h-full transition-all group-hover:border-emerald-500/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-500">Paid Orders</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{stats.paidOrders}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Pesanan lunas <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Pending Orders */}
        <Link href="/admin/orders" className="block group">
          <Card className="h-full transition-all group-hover:border-amber-500/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-500">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Perlu diproses <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Active Members */}
        <Link href="/admin/members" className="block group">
          <Card className="h-full transition-all group-hover:border-blue-500/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-blue-500 transition-colors">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.members}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Member terdaftar <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Catalog Metrics (Games & Products) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/games" className="block group">
          <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">Total Games</CardTitle>
              <Gamepad2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.games}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Kelola katalog game <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/products" className="block group">
          <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Kelola item & nominal <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Daftar transaksi terbaru di toko Anda.</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Lihat Semua Pesanan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Belum ada pesanan terbaru.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {recentOrders.map((o: any) => {
                const invoice = o.invoice_id || o.id;
                const paymentStatus = o.payment_status || 'PENDING';
                return (
                  <div key={o.id || o.invoice_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {invoice}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          paymentStatus === 'EXPIRED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {o.games?.name || 'Game'} • {o.products?.name || 'Product'} {o.payment_channel_id === '11111111-1111-1111-1111-111111111111' ? '• Saldo Akun' : (o.payment_channels?.name ? `• ${o.payment_channels.name}` : '')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs">{(o.currency || currency) === 'MYR' ? '🇲🇾' : '🇮🇩'}</span>
                          <span className="text-sm font-bold text-foreground">
                            {formatCurrency(Number(o.total_price || 0), o.currency || currency)}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <Link 
                        href="/admin/orders" 
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 hover:bg-muted transition-colors text-foreground"
                      >
                        Buka <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
