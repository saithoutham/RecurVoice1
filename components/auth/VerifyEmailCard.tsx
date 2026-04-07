"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function VerifyEmailCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("We emailed you a verification link. Open it to continue.");

  useEffect(() => {
    if (!token) return;
    void verify();
  }, [token]);

  async function verify() {
    setStatus("loading");
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const payload = (await response.json()) as { detail?: string };
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.detail ?? "Could not verify your email.");
      return;
    }
    setStatus("success");
    setMessage("Your email is verified. Taking you to onboarding now.");
    window.setTimeout(() => {
      router.push("/onboarding/welcome");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 text-lg leading-8 text-[#4B5563]">
        {message}
      </div>
      {status === "idle" && token ? (
        <Button className="w-full" onClick={() => void verify()}>
          Verify email
        </Button>
      ) : null}
      {status === "loading" ? <p className="text-base text-[#1B4332]">Checking your verification link...</p> : null}
      {status === "error" ? <p className="text-base text-[#991B1B]">Please request a new verification link by signing up again.</p> : null}
    </div>
  );
}
