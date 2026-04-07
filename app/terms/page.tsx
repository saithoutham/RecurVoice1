import { LegalDocument } from "@/components/legal/LegalDocument";
import { TERMS_INTRO, TERMS_SECTIONS } from "@/lib/legal-documents";

export default function TermsPage() {
  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <LegalDocument title="Terms of Service" intro={TERMS_INTRO} sections={TERMS_SECTIONS} />
    </main>
  );
}
