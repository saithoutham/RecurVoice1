"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.")
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  async function onSubmit(values: FormValues) {
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { detail?: string; onboarding_complete?: boolean };
    if (!response.ok) {
      setError(payload.detail ?? "Could not sign in.");
      return;
    }
    const redirect = searchParams.get("redirect");
    router.push(redirect ?? (payload.onboarding_complete ? "/dashboard" : "/onboarding/welcome"));
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
      {error ? <p className="text-base text-[#991B1B]">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
      <div className="flex items-center justify-between text-base text-[#4B5563]">
        <Link href="/auth/forgot-password" className="font-semibold text-[#1B4332]">
          Forgot password?
        </Link>
        <Link href="/auth/signup" className="font-semibold text-[#1B4332]">
          Create account
        </Link>
      </div>
    </form>
  );
}
