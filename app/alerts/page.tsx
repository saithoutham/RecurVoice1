import { AlertsTable } from "@/components/alerts/AlertsTable";
import { PageIntro } from "@/components/PageIntro";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";

export default async function AlertsPage() {
  const summary = await getCurrentDashboardSummary();
  if (!summary) return null;

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <PageIntro
          eyebrow="Alerts"
          title="Alert history"
          body="Every alert ever triggered for your account appears here with its message and acknowledgement state."
        />
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-3xl font-semibold">Combined clinical alerts</h2>
            <AlertsTable
              kind="convergence"
              alerts={summary.convergenceAlerts.map((alert) => ({
                id: alert.id,
                level: `Level ${alert.convergence_level}`,
                filter_value: `Level ${alert.convergence_level}`,
                message: alert.caregiver_message,
                caregiver_notified: alert.caregiver_notified,
                acknowledged: alert.acknowledged,
                triggered_at: alert.triggered_at
              }))}
            />
          </section>
          <section className="space-y-4">
            <h2 className="text-3xl font-semibold">Voice-only alert history</h2>
            <AlertsTable
              kind="voice"
              alerts={summary.alerts.map((alert) => ({
                id: alert.id,
                level: alert.alert_level,
                filter_value: alert.alert_level,
                message: alert.message,
                caregiver_notified: alert.caregiver_notified,
                acknowledged: alert.acknowledged,
                triggered_at: alert.triggered_at
              }))}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
