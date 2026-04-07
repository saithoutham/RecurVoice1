"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: FormValues) {
    setError("");
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { detail?: string; verification_url?: string };
    if (!response.ok) {
      setError(payload.detail ?? "Could not create account.");
      return;
    }
    setVerificationUrl(payload.verification_url ?? "");
    router.push(`/auth/verify${payload.verification_url ? `?token=${new URL(payload.verification_url).searchParams.get("token")}` : ""}`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" {...form.register("fullName")} />
        {form.formState.errors.fullName ? <p className="text-base text-[#991B1B]">{form.formState.errors.fullName.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-base text-[#991B1B]">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...form.register("password")} />
        {form.formState.errors.password ? <p className="text-base text-[#991B1B]">{form.formState.errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
        {form.formState.errors.confirmPassword ? <p className="text-base text-[#991B1B]">{form.formState.errors.confirmPassword.message}</p> : null}
      </div>
      {error ? <p className="text-base text-[#991B1B]">{error}</p> : null}
      {verificationUrl ? (
        <p className="rounded-xl bg-[#F9FAFB] p-4 text-base text-[#4B5563]">
          Verification email preview: <Link className="font-semibold text-[#1B4332]" href={verificationUrl}>Open verification link</Link>
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating account..." : "Create free account"}
      </Button>
      <p className="text-center text-base text-[#4B5563]">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-[#1B4332]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
