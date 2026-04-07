import Link from "next/link";

import { Progress } from "@/components/ui/progress";

const steps = [
  "/onboarding/welcome",
  "/onboarding/about-you",
  "/onboarding/comorbidity",
  "/onboarding/recurrence-risk",
  "/onboarding/caregiver",
  "/onboarding/how-it-works",
  "/onboarding/consent",
  "/onboarding/baseline-intro"
];

export function OnboardingShell({
  step,
  title,
  body,
  backHref,
  children
}: {
  step: number;
  title: string;
  body: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  const progress = (step / steps.length) * 100;

  return (
    <main className="min-h-[calc(100vh-141px)] bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[800px] space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.18em] text-[#1B4332]">
            <span>Step {step} of {steps.length}</span>
            {backHref ? (
              <Link href={backHref} className="text-[#4B5563]">
                Back
              </Link>
            ) : <span />}
          </div>
          <Progress value={progress} />
        </div>
        <section className="rounded-xl border border-[#E5E7EB] bg-white p-8">
          <h1 className="text-4xl font-semibold text-[#0A0A0A]">{title}</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-[#4B5563]">{body}</p>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
