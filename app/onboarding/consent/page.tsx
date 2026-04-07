import { ConsentForm } from "@/components/onboarding/ConsentForm";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";

export default function ConsentPage() {
  return (
    <OnboardingShell
      step={7}
      title="Consent"
      body="Please review each statement and check every box before continuing."
      backHref="/onboarding/how-it-works"
    >
      <ConsentForm />
    </OnboardingShell>
  );
}
