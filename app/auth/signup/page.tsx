import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your RecurVoice account"
      body="Set up your account to start the 14-day baseline program. You will verify your email before onboarding."
    >
      <SignupForm />
    </AuthShell>
  );
}
