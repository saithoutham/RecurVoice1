"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  TERMS_INTRO,
  TERMS_SECTIONS
} from "@/lib/legal-documents";

const consentCopy = [
  {
    key: "data_collection",
    label:
      "I understand that my voice is analyzed on my device and only the numerical results are stored. My recordings are never uploaded or saved."
  },
  {
    key: "not_medical_device",
    label:
      "I understand that RecurVoice is a wellness monitoring tool. It does not diagnose medical conditions. I will always contact my care team for medical decisions."
  },
  {
    key: "terms_privacy",
    label:
      "I have read and agree to the Terms of Service and Privacy Policy."
  }
];

export function ConsentForm() {
  const router = useRouter();
  const [checked, setChecked] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [openDocument, setOpenDocument] = useState<"terms" | "privacy" | null>(null);

  async function continueFlow() {
    setError("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consents: checked })
    });
    const payload = (await response.json()) as { detail?: string };
    if (!response.ok) {
      setError(payload.detail ?? "Could not save consent.");
      return;
    }
    router.push("/onboarding/baseline-intro");
  }

  const allChecked = checked.length === consentCopy.length;

  return (
    <div className="space-y-6">
      {consentCopy.map((consent) => (
        <label key={consent.key} className="flex items-start gap-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
          <Checkbox
            checked={checked.includes(consent.key)}
            onCheckedChange={(value) => {
              setChecked((current) =>
                value ? [...current, consent.key] : current.filter((entry) => entry !== consent.key)
              );
            }}
          />
          <span className="text-lg leading-8 text-[#0A0A0A]">
            {consent.label}
            {consent.key === "terms_privacy" ? (
              <>
                {" "}
                <span className="inline-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="font-semibold text-[#1B4332] underline"
                    onClick={() => setOpenDocument("terms")}
                  >
                    Terms of Service
                  </button>
                  <span>and</span>
                  <button
                    type="button"
                    className="font-semibold text-[#1B4332] underline"
                    onClick={() => setOpenDocument("privacy")}
                  >
                    Privacy Policy
                  </button>
                </span>
                <Dialog
                  open={openDocument !== null}
                  onOpenChange={(open) => setOpenDocument(open ? openDocument ?? "terms" : null)}
                >
                  <DialogContent className="max-h-[85vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>
                        {openDocument === "privacy" ? "Privacy Policy" : "Terms of Service"}
                      </DialogTitle>
                      <DialogDescription>
                        Review the full document here without leaving onboarding.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setOpenDocument("terms")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          openDocument === "terms"
                            ? "bg-[#1B4332] text-white"
                            : "border border-[#E5E7EB] bg-white text-[#1B4332]"
                        }`}
                      >
                        Terms of Service
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenDocument("privacy")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          openDocument === "privacy"
                            ? "bg-[#1B4332] text-white"
                            : "border border-[#E5E7EB] bg-white text-[#1B4332]"
                        }`}
                      >
                        Privacy Policy
                      </button>
                    </div>
                    <div className="mt-4 max-h-[55vh] overflow-y-auto pr-2">
                      {openDocument === "privacy" ? (
                        <LegalDocument
                          eyebrow="Onboarding"
                          title="Privacy Policy"
                          intro={PRIVACY_INTRO}
                          sections={PRIVACY_SECTIONS}
                          compact
                        />
                      ) : (
                        <LegalDocument
                          eyebrow="Onboarding"
                          title="Terms of Service"
                          intro={TERMS_INTRO}
                          sections={TERMS_SECTIONS}
                          compact
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : null}
          </span>
        </label>
      ))}
      {error ? <p className="text-base text-[#991B1B]">{error}</p> : null}
      <Button className="w-full" disabled={!allChecked} onClick={() => void continueFlow()}>
        Continue
      </Button>
    </div>
  );
}
