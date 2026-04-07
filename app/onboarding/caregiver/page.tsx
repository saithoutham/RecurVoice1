import { redirect } from "next/navigation";

import { CaregiverForm } from "@/components/onboarding/CaregiverForm";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getCurrentUser } from "@/lib/server/current-user";
import { getRecurrenceRiskProfile } from "@/lib/server/store";

export default async function CaregiverPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const recurrenceRisk = await getRecurrenceRiskProfile(user.user.id);
  if (!recurrenceRisk) {
    redirect("/onboarding/recurrence-risk");
  }

  const defaults = user
    ? {
        caregiver_name: user.profile.caregiver_name ?? "",
        caregiver_email: user.profile.caregiver_email ?? "",
        caregiver_phone: user.profile.caregiver_phone ?? ""
      }
    : undefined;

  return (
    <OnboardingShell
      step={5}
      title="Who should we contact if something changes?"
      body="This person will receive an alert if we notice consistent changes in your voice."
      backHref="/onboarding/recurrence-risk"
    >
      <CaregiverForm defaults={defaults} />
    </OnboardingShell>
  );
}
