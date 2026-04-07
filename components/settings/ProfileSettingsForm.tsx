"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  full_name: z.string().min(2),
  date_of_birth: z.string().optional(),
  diagnosis_stage: z.string().optional(),
  treatment_type: z.string().optional(),
  treatment_start_date: z.string().optional(),
  oncologist_name: z.string().optional(),
  oncologist_email: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export function ProfileSettingsForm({ defaults }: { defaults: Partial<FormValues> }) {
  const [message, setMessage] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: defaults.full_name ?? "",
      date_of_birth: defaults.date_of_birth ?? "",
      diagnosis_stage: defaults.diagnosis_stage ?? "",
      treatment_type: defaults.treatment_type ?? "",
      treatment_start_date: defaults.treatment_start_date ?? "",
      oncologist_name: defaults.oncologist_name ?? "",
      oncologist_email: defaults.oncologist_email ?? ""
    }
  });

  async function onSubmit(values: FormValues) {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: values })
    });
    const payload = await response.json();
    setMessage(response.ok ? "Profile updated." : payload.detail ?? "Could not update profile.");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" {...form.register("full_name")} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="date_of_birth">Date of birth</Label><Input id="date_of_birth" type="date" {...form.register("date_of_birth")} /></div>
        <div className="space-y-2"><Label htmlFor="treatment_start_date">Treatment start date</Label><Input id="treatment_start_date" type="date" {...form.register("treatment_start_date")} /></div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="diagnosis_stage">Cancer stage</Label>
          <select id="diagnosis_stage" {...form.register("diagnosis_stage")} className="h-16 w-full rounded-xl border border-[#E5E7EB] px-4 text-lg">
            <option value="">Select one</option>
            <option>Stage I</option><option>Stage II</option><option>Stage III</option><option>Stage IV</option><option>Not sure</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="treatment_type">Treatment type</Label>
          <select id="treatment_type" {...form.register("treatment_type")} className="h-16 w-full rounded-xl border border-[#E5E7EB] px-4 text-lg">
            <option value="">Select one</option>
            <option>Surgery</option><option>Chemotherapy</option><option>Radiation</option><option>Immunotherapy</option><option>Targeted therapy</option><option>Combination</option><option>Surveillance only</option>
          </select>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="oncologist_name">Oncologist name</Label><Input id="oncologist_name" {...form.register("oncologist_name")} /></div>
        <div className="space-y-2"><Label htmlFor="oncologist_email">Oncologist email</Label><Input id="oncologist_email" type="email" {...form.register("oncologist_email")} /></div>
      </div>
      {message ? <p className="text-base text-[#4B5563]">{message}</p> : null}
      <Button type="submit">Save profile</Button>
    </form>
  );
}
