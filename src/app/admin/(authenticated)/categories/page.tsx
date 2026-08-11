import { checkPermission, getActiveAdminTenantId } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { createClient } from "@/utils/supabase/server";
import { CategoriesClient } from "./CategoriesClient";

export default async function CategoriesPage() {
  if (!(await checkPermission("manage_categories"))) {
    return <UnauthorizedAccess permission="manage_categories" />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const currentTenantId = await getActiveAdminTenantId();
      
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
