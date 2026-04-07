import { LegalDocument } from "@/components/legal/LegalDocument";
import { PRIVACY_INTRO, PRIVACY_SECTIONS } from "@/lib/legal-documents";

export default function PrivacyPage() {
  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <LegalDocument title="Privacy Policy" intro={PRIVACY_INTRO} sections={PRIVACY_SECTIONS} />
    </main>
  );
}
