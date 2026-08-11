import { checkPermission, getActiveAdminTenantId } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { createClient } from "@/utils/supabase/server";
import { PaymentClient } from "./PaymentClient";

export default async function PaymentsPage() {
  if (!(await checkPermission("manage_payments"))) {
    return <UnauthorizedAccess permission="manage_payments" />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payments: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const currentTenantId = await getActiveAdminTenantId();
      
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
