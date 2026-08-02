import { createClient } from "@/utils/supabase/server";
import { AdminDepositsClient } from "./AdminDepositsClient";

export const dynamic = 'force-dynamic';

export default async function AdminDepositsPage() {
  const supabase = await createClient();

  const { data: deposits, error } = await supabase
    .from("deposits")
    .select("*, payment_channels(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching deposits:", error);
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
