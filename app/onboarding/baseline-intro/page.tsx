import { BaselineCalendar } from "@/components/BaselineCalendar";
import { BaselineStartButton } from "@/components/onboarding/BaselineStartButton";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";

export default function BaselineIntroPage() {
  return (
    <OnboardingShell
      step={8}
      title="Your 14-day program starts now."
      body="Check in every morning. It takes 60 seconds. Try to do it at the same time each day in a quiet spot. After 14 days your personal baseline is complete and your monitoring begins."
      backHref="/onboarding/consent"
    >
      <div className="space-y-8">
        <BaselineCalendar completedDays={0} />
        <BaselineStartButton />
      </div>
    </OnboardingShell>
  );
}
