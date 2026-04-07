import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyEmailCard } from "@/components/auth/VerifyEmailCard";

export default function VerifyPage() {
  return (
    <AuthShell
      title="Verify your email"
      body="We need to confirm your email address before we start your onboarding and reminders."
    >
      <VerifyEmailCard />
    </AuthShell>
  );
}
