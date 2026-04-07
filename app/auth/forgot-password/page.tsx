import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      body="Enter your email to request a reset link, or set a new password if you opened a reset link already."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
