import { createClient } from "@/utils/supabase/server";
import { RolesClient } from "./RolesClient";
import { checkPermission } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";

export default async function RolesPage() {
  if (!(await checkPermission("manage_roles"))) {
    return <UnauthorizedAccess permission="manage_roles" />;
  }

  const supabase = await createClient();
  const { data: roles } = await supabase
    .from("admin_roles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <RolesClient initialRoles={roles || []} />
    </div>
  );
}
