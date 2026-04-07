"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function BaselineStartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarding_complete: true })
    });
    router.push("/checkin");
    router.refresh();
  }

  return (
    <Button className="w-full" onClick={() => void start()} disabled={loading}>
      {loading ? "Starting..." : "Start Day 1 check-in"}
    </Button>
  );
}
