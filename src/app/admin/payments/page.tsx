import { createClient } from "@/utils/supabase/server";
import { PaymentClient } from "./PaymentClient";

export default async function PaymentsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payments: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("payment_channels")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) payments = data;
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
