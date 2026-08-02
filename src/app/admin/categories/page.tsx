import { createClient } from "@/utils/supabase/server";
import { CategoriesClient } from "./CategoriesClient";

export default async function CategoriesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) categories = data;
    }
  } catch (err) {
    console.error("Gagal mengambil data kategori", err);
  }

  return (
    <div className="space-y-6">
      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
