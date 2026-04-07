"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  caregiver_name: z.string().optional(),
  caregiver_email: z.string().email().or(z.literal("")),
  caregiver_phone: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export function CaregiverSettingsForm({ defaults }: { defaults: Partial<FormValues> }) {
  const [message, setMessage] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caregiver_name: defaults.caregiver_name ?? "",
      caregiver_email: defaults.caregiver_email ?? "",
      caregiver_phone: defaults.caregiver_phone ?? ""
    }
  });

  async function save(values: FormValues) {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: values })
    });
    const payload = await response.json();
    setMessage(response.ok ? "Caregiver updated." : payload.detail ?? "Could not update caregiver.");
  }

  async function sendTest() {
    const response = await fetch("/api/send-test-caregiver", { method: "POST" });
    const payload = await response.json();
    setMessage(response.ok ? `Test sent (${payload.mode}).` : payload.detail ?? "Could not send test email.");
  }

  return (
    <form onSubmit={form.handleSubmit(save)} className="space-y-5">
      <div className="space-y-2"><Label htmlFor="caregiver_name">Caregiver name</Label><Input id="caregiver_name" {...form.register("caregiver_name")} /></div>
      <div className="space-y-2"><Label htmlFor="caregiver_email">Caregiver email</Label><Input id="caregiver_email" type="email" {...form.register("caregiver_email")} /></div>
      <div className="space-y-2"><Label htmlFor="caregiver_phone">Caregiver phone</Label><Input id="caregiver_phone" {...form.register("caregiver_phone")} /></div>
      {message ? <p className="text-base text-[#4B5563]">{message}</p> : null}
      <div className="flex flex-wrap gap-4">
        <Button type="submit">Save caregiver</Button>
        <Button type="button" variant="outline" onClick={() => void sendTest()}>
          Send test notification
        </Button>
      </div>
    </form>
  );
}
