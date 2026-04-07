import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      body="Welcome back. Sign in to complete your daily voice check-in and review your trends."
    >
      <LoginForm />
    </AuthShell>
  );
}
