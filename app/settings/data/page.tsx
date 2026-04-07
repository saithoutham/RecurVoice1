import { PageIntro } from "@/components/PageIntro";
import { DataSettingsPanel } from "@/components/settings/DataSettingsPanel";

export default function DataSettingsPage() {
  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <PageIntro eyebrow="Settings" title="Data controls" body="Download your data or permanently delete your account and monitoring history." />
        <DataSettingsPanel />
      </div>
    </main>
  );
}
