import { redirect } from "next/navigation";

import { RecurrenceRiskFlow } from "@/components/onboarding/RecurrenceRiskFlow";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getCurrentSession } from "@/lib/server/current-user";
import {
  getComorbidityProfile,
  getRecurrenceRiskProfile
} from "@/lib/server/store";

export default async function RecurrenceRiskPage() {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }

  const comorbidity = await getComorbidityProfile(session.userId);
  if (!comorbidity) {
    redirect("/onboarding/comorbidity");
  }

  const existing = await getRecurrenceRiskProfile(session.userId);
  if (existing) {
    redirect("/onboarding/caregiver");
  }

  return (
    <OnboardingShell
      step={4}
      title="Your NCCN-aligned recurrence risk helps set how closely we watch"
      body="These eight questions place you in a plain-language recurrence risk tier using common lung-cancer return risk features. This setting stays separate from your general health background so both signals can adjust monitoring independently."
      backHref="/onboarding/comorbidity"
    >
      <RecurrenceRiskFlow />
    </OnboardingShell>
  );
}
