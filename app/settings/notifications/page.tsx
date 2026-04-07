import { PageIntro } from "@/components/PageIntro";
import { NotificationSettingsForm } from "@/components/settings/NotificationSettingsForm";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";
import { getNotificationPreferences } from "@/lib/server/store";

export default async function NotificationSettingsPage() {
  const summary = await getCurrentDashboardSummary();
  if (!summary) return null;
  const prefs = await getNotificationPreferences(summary.profile.id);

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <PageIntro eyebrow="Settings" title="Notification preferences" body="Choose when reminder, summary, and caregiver emails should be sent." />
        <NotificationSettingsForm defaults={prefs} />
      </div>
    </main>
  );
}
