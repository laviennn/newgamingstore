import { checkPermission, getActiveAdminTenantId } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { AdminDepositsClient } from "./AdminDepositsClient";

export const dynamic = 'force-dynamic';

export default async function AdminDepositsPage() {
  if (!(await checkPermission("manage_deposits"))) {
    redirect("/?error=unauthorized");
  }

  const supabase = await createClient();
  const currentTenantId = await getActiveAdminTenantId();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let deposits: any[] = [];
  
  if (currentTenantId) {
    const { data, error } = await supabase
      .from("deposits")
      .select("*, payment_channels(name)")
      .eq("tenant_id", currentTenantId)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching deposits:", error);
    } else if (data) {
      deposits = data;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deposit Permohonan</h1>
        <p className="text-muted-foreground">
          Kelola semua permohonan deposit saldo dari member.
        </p>
      </div>
      <AdminDepositsClient initialDeposits={deposits || []} />
    </div>
  );
}
