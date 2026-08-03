import { checkPermission } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { CategoriesClient } from "./CategoriesClient";

export default async function CategoriesPage() {
  if (!(await checkPermission("manage_categories"))) {
    redirect("/?error=unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const cookieStore = await cookies();
      const currentTenantId = cookieStore.get('admin_tenant_id')?.value;
      
      if (currentTenantId) {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("tenant_id", currentTenantId)
          .order("sort_order", { ascending: true });
        if (!error && data) categories = data;
      }
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
