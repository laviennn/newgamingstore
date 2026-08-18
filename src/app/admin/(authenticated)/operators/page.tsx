import { createClient } from "@/utils/supabase/server";
import { OperatorsClient } from "./OperatorsClient";
import { checkPermission, getActiveAdminTenantId, getAdminSession } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";

export default async function OperatorsPage() {
  if (!(await checkPermission("manage_operators"))) {
    return <UnauthorizedAccess permission="manage_operators" />;
  }

  const supabase = await createClient();
  const adminSession = await getAdminSession();
  const currentTenantId = await getActiveAdminTenantId();
  const isSuperAdmin = adminSession?.is_superadmin || false;

  // Filter operators by current active tenant
  let usersQuery = supabase
    .from("admin_users")
    .select("*, admin_roles(name), tenants(name)")
    .order("created_at", { ascending: false });

  if (currentTenantId) {
    usersQuery = usersQuery.eq("tenant_id", currentTenantId);
  }

  // Tenants list for modal dropdown
  let tenantsQuery = supabase.from("tenants").select("*").order("name", { ascending: true });
  if (!isSuperAdmin && currentTenantId) {
    tenantsQuery = tenantsQuery.eq("id", currentTenantId);
  }

  const [usersRes, rolesRes, tenantsRes] = await Promise.all([
    usersQuery,
    supabase.from("admin_roles").select("*").order("name", { ascending: true }),
    tenantsQuery,
  ]);

  return (
    <div className="space-y-6">
      <OperatorsClient
        initialOperators={usersRes.data || []}
        roles={rolesRes.data || []}
        tenants={tenantsRes.data || []}
        currentTenantId={currentTenantId}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}

