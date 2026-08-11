import { checkPermission, getActiveAdminTenantId } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { createClient } from "@/utils/supabase/server";
import { AdminMembershipsClient } from "./AdminMembershipsClient";

export const dynamic = 'force-dynamic';

export default async function AdminMembershipsPage() {
  if (!(await checkPermission("manage_memberships"))) {
    return <UnauthorizedAccess permission="manage_memberships" />;
  }

  const supabase = await createClient();
  const currentTenantId = await getActiveAdminTenantId();
  
  let packages = [];
  
  if (currentTenantId) {
    const { data, error } = await supabase
      .from("membership_packages")
      .select("*")
      .eq("tenant_id", currentTenantId)
      .order("price", { ascending: true });
      
    if (error) {
      console.error("Error fetching membership packages:", error);
    } else if (data) {
      packages = data;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paket Membership</h1>
        <p className="text-muted-foreground">
          Kelola opsi paket upgrade membership dan tentukan keuntungan (benefits) masing-masing level.
        </p>
      </div>
      <AdminMembershipsClient initialPackages={packages || []} currentTenantId={currentTenantId || ""} />
    </div>
  );
}
