import { getApiValidationLogs, getApiValidationStats } from "./actions";
import { ApiLogsClient } from "./ApiLogsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApiLogsPage() {
  const [logsRes, stats] = await Promise.all([
    getApiValidationLogs({ page: 1, limit: 20 }),
    getApiValidationStats(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">API Validation Logs</h1>
        <p className="text-sm text-muted-foreground">
          Monitoring penggunaan API Check Username (KokinPay, VIP Reseller & RapidAPI), performa latensi, serta sisa kuota RapidAPI.
        </p>
      </div>

      <ApiLogsClient
        initialLogs={logsRes.logs}
        initialTotal={logsRes.total}
        initialStats={stats}
      />
    </div>
  );
}
