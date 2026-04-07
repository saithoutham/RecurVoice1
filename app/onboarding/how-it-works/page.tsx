import { HowItWorksExplainer } from "@/components/onboarding/HowItWorksExplainer";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";

export default function HowItWorksPage() {
  return (
    <OnboardingShell
      step={6}
      title="How RecurVoice works"
      body="Before you start, here is the full picture of what the daily program does and how the voice trend is used."
      backHref="/onboarding/caregiver"
    >
      <HowItWorksExplainer />
    </OnboardingShell>
  );
}
