import { checkPermission } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { PaymentClient } from "./PaymentClient";

export default async function PaymentsPage() {
  if (!(await checkPermission("manage_payments"))) {
    redirect("/?error=unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payments: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const cookieStore = await cookies();
      const currentTenantId = cookieStore.get('admin_tenant_id')?.value;
      
      if (currentTenantId) {
        const { data, error } = await supabase
          .from("payment_channels")
          .select("*")
          .eq("tenant_id", currentTenantId)
          .order("created_at", { ascending: true });
        if (!error && data) payments = data;
      }
    }
  } catch (err) {
    console.error("Gagal mengambil data payments", err);
  }

  return (
    <div className="space-y-6">
      <PaymentClient initialPayments={payments} />
    </div>
  );
}
