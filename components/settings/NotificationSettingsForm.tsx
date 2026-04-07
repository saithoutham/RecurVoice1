"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Defaults = {
  daily_reminder_enabled: boolean;
  daily_reminder_time: string;
  weekly_summary_enabled: boolean;
  caregiver_alert_enabled: boolean;
};

export function NotificationSettingsForm({ defaults }: { defaults: Defaults }) {
  const [state, setState] = useState(defaults);
  const [message, setMessage] = useState("");

  async function save() {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications: state })
    });
    const payload = await response.json();
    setMessage(response.ok ? "Notification settings updated." : payload.detail ?? "Could not save notification settings.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-5">
        <div>
          <p className="text-lg font-semibold">Daily reminder email</p>
          <p className="text-base text-[#4B5563]">Email me if I have not checked in yet.</p>
        </div>
        <Switch checked={state.daily_reminder_enabled} onCheckedChange={(value) => setState({ ...state, daily_reminder_enabled: value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="daily_reminder_time">Reminder time</Label>
        <Input id="daily_reminder_time" type="time" value={state.daily_reminder_time} onChange={(event) => setState({ ...state, daily_reminder_time: event.target.value })} />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-5">
        <div>
          <p className="text-lg font-semibold">Weekly summary email</p>
          <p className="text-base text-[#4B5563]">Send me a Sunday trend recap.</p>
        </div>
        <Switch checked={state.weekly_summary_enabled} onCheckedChange={(value) => setState({ ...state, weekly_summary_enabled: value })} />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-5">
        <div>
          <p className="text-lg font-semibold">Immediate caregiver alert</p>
          <p className="text-base text-[#4B5563]">Notify my caregiver on EARLY_WARNING or URGENT.</p>
        </div>
        <Switch checked={state.caregiver_alert_enabled} onCheckedChange={(value) => setState({ ...state, caregiver_alert_enabled: value })} />
      </div>
      {message ? <p className="text-base text-[#4B5563]">{message}</p> : null}
      <Button onClick={() => void save()}>Save notification settings</Button>
    </div>
  );
}
