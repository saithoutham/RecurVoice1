import { PageIntro } from "@/components/PageIntro";
import { WeeklyCheckinFlow } from "@/components/weekly/WeeklyCheckinFlow";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";

export default async function WeeklyCheckinPage() {
  const summary = await getCurrentDashboardSummary();
  if (!summary) {
    return null;
  }

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <PageIntro
          eyebrow="Weekly check-in"
          title="Your weekly symptom check-in"
          body="This takes under 60 seconds. It helps RecurVoice compare your voice changes with how you felt this week."
        />
        <WeeklyCheckinFlow />
      </div>
    </main>
  );
}
