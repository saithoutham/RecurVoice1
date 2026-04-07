import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, Bell, Mic, Waves } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function StepCard({
  icon,
  title,
  body
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#1B4332]">
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function LandingPage() {
  redirect("/dashboard");
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[1200px] px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1B4332]">
              Post-diagnosis lung cancer monitoring
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-[#0A0A0A] sm:text-6xl">
              Your voice changes before you feel sick.
            </h1>
            <p className="max-w-2xl text-xl leading-9 text-[#4B5563]">
              RecurVoice tracks micro-changes in your voice every day to detect lung cancer recurrence weeks before your next CT scan.
            </p>
            <p className="max-w-2xl text-lg leading-8 text-[#4B5563]">
              This matters in lung cancer because the recurrent laryngeal nerve runs close to the lymph nodes where recurrence often shows up first. When that nerve gets pressed, the voice can change before a person notices any clear symptom.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/signup">Create free account</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/demo/start">Try the demo first</Link>
              </Button>
            </div>
            <p className="text-base text-[#6B7280]">
              No account required for the demo. Your audio never leaves your browser.
            </p>
          </div>

          <Card className="bg-[#F9FAFB]">
            <CardHeader>
              <CardTitle className="text-3xl">What you will see after 14 days</CardTitle>
              <CardDescription>
                Daily check-ins become trends, scores, and plain English updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-[#1B4332]">Trend screen</p>
                <div className="mt-4 h-28 rounded-lg bg-gradient-to-r from-[#DCFCE7] via-[#FEF3C7] to-[#FEE2E2]" />
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-[#1B4332]">Score explanations</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-[#F9FAFB] p-4 text-center text-sm font-semibold">HNR</div>
                  <div className="rounded-lg bg-[#F9FAFB] p-4 text-center text-sm font-semibold">Jitter</div>
                  <div className="rounded-lg bg-[#F9FAFB] p-4 text-center text-sm font-semibold">Shimmer</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-[#F9FAFB] py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-semibold">How the 14-day program works</h2>
            <p className="mt-4 text-lg leading-8 text-[#4B5563]">
              The first week teaches RecurVoice what your voice normally sounds like. After that, your daily check-in is compared to your own baseline.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <StepCard icon={<Mic className="h-6 w-6" />} title="Record daily" body="Each morning you do one sustained Ahhhh and one short reading sample." />
            <StepCard icon={<Waves className="h-6 w-6" />} title="Build your baseline" body="Over 14 days we learn your normal voice pattern and how much natural variation you have." />
            <StepCard icon={<Bell className="h-6 w-6" />} title="Track for changes" body="After baseline, the system watches for gradual changes and explains what it notices in plain English." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Why voice matters in lung cancer follow-up</CardTitle>
              <CardDescription>
                RecurVoice is not listening for a diagnosis. It is watching for an early change signal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-8 text-[#4B5563]">
              <p>
                The nerve that helps move the left vocal cord passes through the chest near the area where lung cancer can come back. If something starts pressing on that nerve, the voice may sound a little rougher, less steady, or more breathy.
              </p>
              <p>
                Those changes can be too small for family members to hear day to day. RecurVoice measures them with the same short voice task every time and looks for slow change over time.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">How to get the most accurate check-in</CardTitle>
              <CardDescription>
                The cleaner and more consistent the recording, the more useful the trend becomes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-8 text-[#4B5563]">
              <p>
                Do your check-in at about the same time each day. Use a quiet room. Hold the device still and do not move it during the Ahhhh.
              </p>
              <p>
                Take one full breath, say AHHHH in your normal voice, keep the pitch steady, and do not trail off early. Then read the sentence naturally, as if talking to another person.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-semibold">The science behind RecurVoice</h2>
          <p className="mt-6 text-lg leading-8 text-[#4B5563]">
            The recurrent laryngeal nerve runs directly past the lymph nodes where lung cancer most commonly recurs. As a tumor grows, it can press on this nerve before other symptoms appear. That pressure changes the voice in ways too subtle for the human ear, but measurable with acoustic biomarkers.
          </p>
          <p className="mt-4 text-base italic text-[#6B7280]">
            Based on peer-reviewed research in acoustic biomarkers for vocal fold paresis detection.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <StepCard icon={<Activity className="h-6 w-6" />} title="Voice biomarkers" body="RecurVoice tracks HNR, jitter, shimmer, and related features that reflect how smooth, steady, and even the vocal folds are moving." />
          <StepCard icon={<Waves className="h-6 w-6" />} title="Drift over time" body="The system is designed to watch trends, not single-day readings, because trend signals are more reliable." />
          <StepCard icon={<Bell className="h-6 w-6" />} title="Plain English output" body="When something changes, the result is explained in everyday language and shared with the patient and caregiver." />
        </div>
      </section>
    </main>
  );
}
