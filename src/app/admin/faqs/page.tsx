import { createClient } from "@/utils/supabase/server";
import { FaqClient } from "./FaqClient";

export default async function FaqsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let faqs: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (!error && data) faqs = data;
    }
  } catch (err) {
    console.error("Gagal mengambil data FAQ", err);
  }

  return (
    <div className="space-y-6">
      <FaqClient initialFaqs={faqs} />
    </div>
  );
}
