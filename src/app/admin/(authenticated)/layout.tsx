import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TenantSelector } from "@/components/admin/TenantSelector";
import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { Gamepad2 } from "lucide-react";
import { getAdminSession, getActiveAdminTenantId } from "@/app/admin/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminSession = await getAdminSession();
  
  if (!adminSession) {
    redirect("/login");
  }

  const isSuperAdmin = adminSession.is_superadmin;
  const permissions: string[] = adminSession.admin_roles?.permissions || [];
  
  const supabase = await createClient();
  const { data: tenants } = await supabase.from('tenants').select('id, name, theme_config').order('created_at', { ascending: true });
  
  const currentTenantId = await getActiveAdminTenantId();
  const currentTenant = tenants?.find((t) => t.id === currentTenantId);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex shrink-0">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span>Admin Dashboard</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <AdminSidebarNav isSuperAdmin={isSuperAdmin} permissions={permissions} />
        </div>
      </aside>
      
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 lg:pl-0 flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <AdminMobileNav isSuperAdmin={isSuperAdmin} permissions={permissions} />
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
