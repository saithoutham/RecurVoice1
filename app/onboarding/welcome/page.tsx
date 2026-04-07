import Link from "next/link";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/button";

export default function OnboardingWelcomePage() {
  return (
    <OnboardingShell
      step={1}
      title="Welcome to RecurVoice."
      body="Over the next 14 days we will learn what your voice normally sounds like. After that we will let you know if anything changes."
    >
      <Button asChild className="w-full">
        <Link href="/onboarding/about-you">Let&apos;s get started</Link>
      </Button>
    </OnboardingShell>
  );
}
