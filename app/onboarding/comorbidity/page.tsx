import { redirect } from "next/navigation";

import { ComorbidityFlow } from "@/components/onboarding/ComorbidityFlow";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getCurrentSession } from "@/lib/server/current-user";
import { getComorbidityProfile } from "@/lib/server/store";

export default async function ComorbidityPage() {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }

  const existing = await getComorbidityProfile(session.userId);
  if (existing) {
    redirect("/onboarding/recurrence-risk");
  }

  return (
    <OnboardingShell
      step={3}
      title="A few quick health questions"
      body="These help us set your monitoring sensitivity to match your health background. Takes under 2 minutes. Only happens once."
      backHref="/onboarding/about-you"
    >
      <ComorbidityFlow />
    </OnboardingShell>
  );
}
