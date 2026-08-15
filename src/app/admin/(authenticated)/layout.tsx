import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TenantSelector } from "@/components/admin/TenantSelector";
import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import { LayoutDashboard, Users, Gamepad2, ShoppingCart, FileText, Settings, Menu, Layers, BookOpen, HelpCircle, Contact, CreditCard, Palette, Tag, ChevronDown, Folder, Globe, Shield, Crown, UserCheck, Activity, History } from "lucide-react";
import { getAdminSession, setAdminTenantCookie, getActiveAdminTenantId } from "@/app/admin/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminSession = await getAdminSession();
  
  if (!adminSession) {
    redirect("/login");
  }

  const isSuperAdmin = adminSession.is_superadmin;
  const permissions: string[] = adminSession.admin_roles?.permissions || [];
  const hasPerm = (p: string) => isSuperAdmin || permissions.includes(p);
  
  const supabase = await createClient();
  const { data: tenants } = await supabase.from('tenants').select('id, name, theme_config').order('created_at', { ascending: true });
  
  const currentTenantId = await getActiveAdminTenantId();
  const currentTenant = tenants?.find((t) => t.id === currentTenantId);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Gamepad2 className="h-6 w-6" />
            <span>Admin Dashboard</span>
          </Link>
        </div>
        <div className="flex-1 py-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {(hasPerm("manage_games") || hasPerm("manage_categories") || hasPerm("manage_products")) && (
            <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
              <summary className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <Folder className="h-4 w-4" />
                  <span>Katalog & Layanan</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                {hasPerm("manage_games") && (
                <Link href="/games" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Gamepad2 className="h-4 w-4" /> Games
                </Link>
                )}
                {hasPerm("manage_categories") && (
                <Link href="/categories" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Layers className="h-4 w-4" /> Categories
                </Link>
                )}
                {hasPerm("manage_products") && (
                <Link href="/products" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <ShoppingCart className="h-4 w-4" /> Products
                </Link>
                )}
              </div>
            </details>
            )}

            {(hasPerm("manage_orders") || hasPerm("manage_deposits") || hasPerm("manage_payments") || hasPerm("manage_promos") || hasPerm("manage_memberships") || hasPerm("manage_members")) && (
            <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
              <summary className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4" />
                  <span>Transaksi & Promo</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                {hasPerm("manage_orders") && (
                <Link href="/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <FileText className="h-4 w-4" /> Orders
                </Link>
                )}
                {hasPerm("manage_deposits") && (
                <Link href="/deposits" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <CreditCard className="h-4 w-4" /> Deposits
                </Link>
                )}
                {hasPerm("manage_payments") && (
                <Link href="/payments" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <CreditCard className="h-4 w-4" /> Payments
                </Link>
                )}
                {hasPerm("manage_promos") && (
                <Link href="/promos" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Tag className="h-4 w-4" /> Promos
                </Link>
                )}
                {hasPerm("manage_memberships") && (
                <Link href="/memberships" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Crown className="h-4 w-4" /> Paket Membership
                </Link>
                )}
                {hasPerm("manage_members") && (
                <Link href="/members" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <UserCheck className="h-4 w-4" /> Members
                </Link>
                )}
              </div>
            </details>
            )}

            {(hasPerm("manage_articles") || hasPerm("manage_faqs") || hasPerm("manage_contacts")) && (
            <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
              <summary className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4" />
                  <span>Konten & Informasi</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                {hasPerm("manage_articles") && (
                <Link href="/articles" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <BookOpen className="h-4 w-4" /> Articles
                </Link>
                )}
                {hasPerm("manage_faqs") && (
                <Link href="/faqs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <HelpCircle className="h-4 w-4" /> FAQ
                </Link>
                )}
                {hasPerm("manage_contacts") && (
                <Link href="/contacts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Contact className="h-4 w-4" /> Contacts & Footer
                </Link>
                )}
              </div>
            </details>
            )}

            {(isSuperAdmin || hasPerm("manage_roles") || hasPerm("manage_operators") || hasPerm("manage_content") || hasPerm("manage_theme")) && (
            <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
              <summary className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4" />
                  <span>Pengaturan Sistem</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                {isSuperAdmin && (
                  <Link href="/tenants" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                    <Users className="h-4 w-4" /> Tenants
                  </Link>
                )}
                {hasPerm("manage_content") && (
                  <Link href="/content" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                    <Settings className="h-4 w-4" /> Content & Settings
                  </Link>
                )}
                {hasPerm("manage_theme") && (
                  <Link href="/theme" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                    <Palette className="h-4 w-4" /> Theme & Branding
                  </Link>
                )}
                {isSuperAdmin && (
                  <Link href="/api-logs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                    <Activity className="h-4 w-4" /> API Logs & Kuota
                  </Link>
                )}
                {hasPerm("manage_roles") && (
                  <Link href="/roles" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                    <Shield className="h-4 w-4" /> Roles & Permissions
                  </Link>
                )}
                {hasPerm("manage_operators") && (
                  <Link href="/operators" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                    <UserCheck className="h-4 w-4" /> Operators
                  </Link>
                )}
                {(isSuperAdmin || hasPerm("manage_activity_logs")) && (
                  <Link href="/activity-logs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                    <History className="h-4 w-4" /> Activity Logs
                  </Link>
                )}
              </div>
            </details>
            )}
          </nav>
        </div>
      </aside>
      
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 lg:pl-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <button className="sm:hidden flex items-center justify-center">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1">
             <h1 className="text-xl font-semibold sm:hidden">Admin</h1>
          </div>
          <div className="flex items-center gap-4">
             {isSuperAdmin && tenants && currentTenantId && (
                <TenantSelector tenants={tenants} currentTenantId={currentTenantId} />
             )}
             {!isSuperAdmin && currentTenant && (
                <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
                  (currentTenant.theme_config?.currency === 'MYR' || currentTenant.theme_config?.language === 'ms')
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                }`}>
                  <span className="text-sm leading-none">
                    {(currentTenant.theme_config?.currency === 'MYR' || currentTenant.theme_config?.language === 'ms') ? '🇲🇾' : '🇮🇩'}
                  </span>
                  <span>
                    {(currentTenant.theme_config?.currency === 'MYR' || currentTenant.theme_config?.language === 'ms') ? 'MYR (RM)' : 'IDR (Rp)'}
                  </span>
                </div>
             )}
             <AdminUserMenu 
               email={adminSession.email || ""} 
               isSuperAdmin={isSuperAdmin} 
               roleName={adminSession.admin_roles?.name} 
             />
          </div>
        </header>
        
        {/* Main Content */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
