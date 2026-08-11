import { createClient } from "@/utils/supabase/server";
import { OperatorsClient } from "./OperatorsClient";
import { checkPermission } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";

export default async function OperatorsPage() {
  if (!(await checkPermission("manage_operators"))) {
    return <UnauthorizedAccess permission="manage_operators" />;
  }

  const supabase = await createClient();

  const [usersRes, rolesRes, tenantsRes] = await Promise.all([
    supabase
      .from("admin_users")
      .select("*, admin_roles(name), tenants(name)")
      .order("created_at", { ascending: false }),
    supabase.from("admin_roles").select("*").order("name", { ascending: true }),
    supabase.from("tenants").select("*").order("name", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <OperatorsClient
        initialOperators={usersRes.data || []}
        roles={rolesRes.data || []}
        tenants={tenantsRes.data || []}
      />
    </div>
  );
}
