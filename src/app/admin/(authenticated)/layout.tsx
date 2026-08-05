import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TenantSelector } from "@/components/admin/TenantSelector";
import { LayoutDashboard, Users, Gamepad2, ShoppingCart, FileText, Settings, Menu, Layers, BookOpen, HelpCircle, Contact, CreditCard, Palette, Tag, ChevronDown, Folder, Globe, Shield, Crown, UserCheck } from "lucide-react";
import { getAdminSession, setAdminTenantCookie, getActiveAdminTenantId } from "@/app/admin/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminSession = await getAdminSession();
  
  if (!adminSession) {
    redirect("/login");
  }

  const isSuperAdmin = adminSession.is_superadmin;
  const supabase = await createClient();
  const { data: tenants } = await supabase.from('tenants').select('id, name').order('created_at', { ascending: true });
  
  const currentTenantId = await getActiveAdminTenantId();

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

            <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
              <summary className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <Folder className="h-4 w-4" />
                  <span>Katalog & Layanan</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                <Link href="/games" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Gamepad2 className="h-4 w-4" /> Games
                </Link>
                <Link href="/categories" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Layers className="h-4 w-4" /> Categories
                </Link>
                <Link href="/products" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <ShoppingCart className="h-4 w-4" /> Products
                </Link>
              </div>
            </details>

            <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
              <summary className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4" />
                  <span>Transaksi & Promo</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                <Link href="/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <FileText className="h-4 w-4" /> Orders
                </Link>
                <Link href="/deposits" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <CreditCard className="h-4 w-4" /> Deposits
                </Link>
                <Link href="/payments" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <CreditCard className="h-4 w-4" /> Payments
                </Link>
                <Link href="/promos" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Tag className="h-4 w-4" /> Promos
                </Link>
                <Link href="/memberships" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Crown className="h-4 w-4" /> Paket Membership
                </Link>
                <Link href="/members" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <UserCheck className="h-4 w-4" /> Members
                </Link>
              </div>
            </details>

            <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
              <summary className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4" />
                  <span>Konten & Informasi</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                <Link href="/articles" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <BookOpen className="h-4 w-4" /> Articles
                </Link>
                <Link href="/faqs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <HelpCircle className="h-4 w-4" /> FAQ
                </Link>
                <Link href="/contacts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Contact className="h-4 w-4" /> Contacts & Footer
                </Link>
              </div>
            </details>

            <details className="group [&_summary::-webkit-details-marker]:hidden mt-2">
              <summary className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50 cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4" />
                  <span>Pengaturan Sistem</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                <Link href="/tenants" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Users className="h-4 w-4" /> Tenants
                </Link>
                <Link href="/content" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Settings className="h-4 w-4" /> Content & Settings
                </Link>
                <Link href="/theme" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                  <Palette className="h-4 w-4" /> Theme & Branding
                </Link>
                {isSuperAdmin && (
                  <>
                    <Link href="/roles" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                      <Shield className="h-4 w-4" /> Roles & Permissions
                    </Link>
                    <Link href="/operators" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted/30">
                      <UserCheck className="h-4 w-4" /> Operators
                    </Link>
                  </>
                )}
              </div>
            </details>
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
             <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                A
             </div>
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
