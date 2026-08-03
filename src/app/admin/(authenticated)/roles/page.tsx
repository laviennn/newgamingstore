import { createClient } from "@/utils/supabase/server";
import { RolesClient } from "./RolesClient";
import { checkPermission, getAdminSession } from "@/app/admin/actions";
import { redirect } from "next/navigation";

export default async function RolesPage() {
  const adminSession = await getAdminSession();
  if (!adminSession?.is_superadmin) {
    redirect("/?error=unauthorized");
  }

  const supabase = await createClient();
  const { data: roles } = await supabase.from('admin_roles').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <RolesClient initialRoles={roles || []} />
    </div>
  );
}
