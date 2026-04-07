"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  caregiver_name: z.string().optional(),
  caregiver_email: z.string().email("Enter a valid email address.").or(z.literal("")),
  caregiver_phone: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export function CaregiverForm({ defaults }: { defaults?: Partial<FormValues> }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caregiver_name: defaults?.caregiver_name ?? "",
      caregiver_email: defaults?.caregiver_email ?? "",
      caregiver_phone: defaults?.caregiver_phone ?? ""
    }
  });

  async function save(values: FormValues, skip = false) {
    setError("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: skip
          ? { caregiver_name: "", caregiver_email: "", caregiver_phone: "" }
          : values
      })
    });
    const payload = (await response.json()) as { detail?: string };
    if (!response.ok) {
      setError(payload.detail ?? "Could not save caregiver info.");
      return;
    }
    router.push("/onboarding/how-it-works");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit((values) => save(values))} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="caregiver_name">Caregiver name</Label>
        <Input id="caregiver_name" {...form.register("caregiver_name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="caregiver_email">Caregiver email</Label>
        <Input id="caregiver_email" type="email" {...form.register("caregiver_email")} />
        {form.formState.errors.caregiver_email ? <p className="text-base text-[#991B1B]">{form.formState.errors.caregiver_email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="caregiver_phone">Caregiver phone</Label>
        <Input id="caregiver_phone" {...form.register("caregiver_phone")} />
      </div>
      {error ? <p className="text-base text-[#991B1B]">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Button type="button" variant="outline" onClick={() => void save(form.getValues(), true)}>
          Skip for now
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
