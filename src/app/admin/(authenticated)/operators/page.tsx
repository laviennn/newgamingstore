import { createClient } from "@/utils/supabase/server";
import { OperatorsClient } from "./OperatorsClient";
import { getAdminSession } from "@/app/admin/actions";
import { redirect } from "next/navigation";

export default async function OperatorsPage() {
  const adminSession = await getAdminSession();
  if (!adminSession?.is_superadmin) {
    redirect("/?error=unauthorized");
  }

  const supabase = await createClient();
  
  const [usersRes, rolesRes, tenantsRes] = await Promise.all([
    supabase.from('admin_users').select('*, admin_roles(name), tenants(name)').order('created_at', { ascending: false }),
    supabase.from('admin_roles').select('*').order('name', { ascending: true }),
    supabase.from('tenants').select('*').order('name', { ascending: true }),
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
