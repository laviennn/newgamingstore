import { checkPermission, getActiveAdminTenantId } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { createClient } from "@/utils/supabase/server";
import { MembersClient } from "./MembersClient";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  if (!(await checkPermission("manage_members"))) {
    return <UnauthorizedAccess permission="manage_members" />;
  }

  const supabase = await createClient();
  const currentTenantId = await getActiveAdminTenantId();

  let members: { id: string; username: string; phone: string | null; created_at: string }[] = [];
  let authMode = "email";

  if (currentTenantId) {
    const [membersRes, tenantRes] = await Promise.all([
      supabase
        .from("members")
        .select("id, username, phone, created_at")
        .eq("tenant_id", currentTenantId)
        .order("created_at", { ascending: false }),
      supabase
        .from("tenants")
        .select("auth_mode")
        .eq("id", currentTenantId)
        .maybeSingle(),
    ]);

    if (membersRes.data) members = membersRes.data;
    authMode = tenantRes.data?.auth_mode || "email";
  }

  return (
    <div className="space-y-6">
      <MembersClient initialMembers={members} authMode={authMode} />
    </div>
  );
}
