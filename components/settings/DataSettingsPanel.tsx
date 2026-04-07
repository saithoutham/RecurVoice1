"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DataSettingsPanel() {
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");

  async function downloadData() {
    const response = await fetch("/api/settings/data");
    const payload = await response.json();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "recurvoice-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Data export downloaded.");
  }

  async function deleteAccount() {
    if (confirmation !== "DELETE") {
      setMessage('Type "DELETE" to confirm.');
      return;
    }
    const response = await fetch("/api/settings/data", { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.detail ?? "Could not delete account.");
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-2xl font-semibold">Download my data</h2>
        <p className="mt-2 text-lg leading-8 text-[#4B5563]">Download your profile, sessions, scores, alerts, and baseline data as JSON.</p>
        <Button className="mt-5" onClick={() => void downloadData()}>
          Download my data
        </Button>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-2xl font-semibold text-red-900">Delete my account</h2>
        <p className="mt-2 text-lg leading-8 text-red-800">This permanently removes your profile, sessions, alerts, and account access.</p>
        <div className="mt-5 space-y-2">
          <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
          <Input id="delete-confirm" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </div>
        <Button variant="danger" className="mt-5" onClick={() => void deleteAccount()}>
          Delete my account
        </Button>
      </div>
      {message ? <p className="text-base text-[#4B5563]">{message}</p> : null}
    </div>
  );
}
