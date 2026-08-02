import { createClient } from "@/utils/supabase/server";
import { AdminMembershipsClient } from "./AdminMembershipsClient";

export const dynamic = 'force-dynamic';

export default async function AdminMembershipsPage() {
  const supabase = await createClient();

  const { data: packages, error } = await supabase
    .from("membership_packages")
    .select("*")
    .order("price", { ascending: true });

  if (error) {
    console.error("Error fetching membership packages:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paket Membership</h1>
        <p className="text-muted-foreground">
          Kelola opsi paket upgrade membership dan tentukan keuntungan (benefits) masing-masing level.
        </p>
      </div>
      <AdminMembershipsClient initialPackages={packages || []} />
    </div>
  );
}
