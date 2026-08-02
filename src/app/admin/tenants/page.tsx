import { createClient } from "@/utils/supabase/server";
import { TenantsClient } from "./TenantsClient";

export default async function TenantsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tenants: any[] = [];
  
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
      if (!error && data) tenants = data;
    }
  } catch {}

  if (tenants.length === 0) {
    tenants = [
      { id: "1", name: "Alpha Gaming (Mock)", domain: "alpha.localhost", created_at: "2026-07-01T00:00:00Z" },
    ];
  }

  return <TenantsClient initialTenants={tenants} />;
}
