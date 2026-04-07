"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const requestSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

const resetSchema = z
  .object({
    email: z.string().email("Enter the email for this account."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

type RequestValues = z.infer<typeof requestSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export function ForgotPasswordForm() {
  const token = useSearchParams().get("token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewLink, setPreviewLink] = useState("");

  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" }
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" }
  });

  async function requestReset(values: RequestValues) {
    setError("");
    setSuccess("");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { detail?: string; reset_url?: string | null };
    if (!response.ok) {
      setError(payload.detail ?? "Could not start reset.");
      return;
    }
    setPreviewLink(payload.reset_url ?? "");
    setSuccess("If that email is in RecurVoice, a reset link is ready.");
  }

  async function completeReset(values: ResetValues) {
    setError("");
    setSuccess("");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        email: values.email,
        password: values.password
      })
    });
    const payload = (await response.json()) as { detail?: string };
    if (!response.ok) {
      setError(payload.detail ?? "Could not reset password.");
      return;
    }
    setSuccess("Password updated. You can sign in now.");
  }

  if (token) {
    return (
      <form onSubmit={resetForm.handleSubmit(completeReset)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...resetForm.register("email")} />
          {resetForm.formState.errors.email ? <p className="text-base text-[#991B1B]">{resetForm.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" {...resetForm.register("password")} />
          {resetForm.formState.errors.password ? <p className="text-base text-[#991B1B]">{resetForm.formState.errors.password.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" type="password" {...resetForm.register("confirmPassword")} />
          {resetForm.formState.errors.confirmPassword ? <p className="text-base text-[#991B1B]">{resetForm.formState.errors.confirmPassword.message}</p> : null}
        </div>
        {error ? <p className="text-base text-[#991B1B]">{error}</p> : null}
        {success ? <p className="text-base text-green-700">{success}</p> : null}
        <Button type="submit" className="w-full">
          Save new password
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={requestForm.handleSubmit(requestReset)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...requestForm.register("email")} />
        {requestForm.formState.errors.email ? <p className="text-base text-[#991B1B]">{requestForm.formState.errors.email.message}</p> : null}
      </div>
      {error ? <p className="text-base text-[#991B1B]">{error}</p> : null}
      {success ? <p className="text-base text-green-700">{success}</p> : null}
      {previewLink ? (
        <p className="rounded-xl bg-[#F9FAFB] p-4 text-base text-[#4B5563]">
          Reset link preview: <Link href={previewLink} className="font-semibold text-[#1B4332]">Open reset link</Link>
        </p>
      ) : null}
      <Button type="submit" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
