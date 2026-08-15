import { checkPermission, getActiveAdminTenantId } from "@/app/admin/actions";
import { UnauthorizedAccess } from "@/components/admin/UnauthorizedAccess";
import { createClient } from "@/utils/supabase/server";
import { ActivityLogsClient } from "./ActivityLogsClient";

export const dynamic = "force-dynamic";

export default async function ActivityLogsPage() {
  const hasAccess = await checkPermission("manage_activity_logs");
  if (!hasAccess) {
    return <UnauthorizedAccess permission="manage_activity_logs" />;
  }

  const supabase = await createClient();
  const currentTenantId = await getActiveAdminTenantId();

  let logs: any[] = [];

  try {
    let query = supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (currentTenantId) {
      query = query.eq("tenant_id", currentTenantId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[ActivityLogsPage Error]", error);
    } else if (data) {
      logs = data;
    }
  } catch (err) {
    console.error("[ActivityLogsPage Exception]", err);
  }

  return <ActivityLogsClient initialLogs={logs} />;
}
