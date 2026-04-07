import { AboutYouForm } from "@/components/onboarding/AboutYouForm";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getCurrentUser } from "@/lib/server/current-user";

export default async function AboutYouPage() {
  const user = await getCurrentUser();
  const defaults = user
    ? {
        full_name: user.profile.full_name,
        date_of_birth: user.profile.date_of_birth ?? "",
        diagnosis_stage: user.profile.diagnosis_stage ?? "",
        treatment_type: user.profile.treatment_type ?? "",
        treatment_start_date: user.profile.treatment_start_date ?? "",
        oncologist_name: user.profile.oncologist_name ?? "",
        oncologist_email: user.profile.oncologist_email ?? ""
      }
    : undefined;

  return (
    <OnboardingShell
      step={2}
      title="Tell us about you"
      body="This helps us personalize your reminders and reports. Only your full name is required."
      backHref="/onboarding/welcome"
    >
      <AboutYouForm defaults={defaults} />
    </OnboardingShell>
  );
}
