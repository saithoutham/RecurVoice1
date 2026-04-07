import { PageIntro } from "@/components/PageIntro";
import { CaregiverSettingsForm } from "@/components/settings/CaregiverSettingsForm";
import { getCurrentUser } from "@/lib/server/current-user";

export default async function CaregiverSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const defaults = {
    caregiver_name: user.profile.caregiver_name ?? "",
    caregiver_email: user.profile.caregiver_email ?? "",
    caregiver_phone: user.profile.caregiver_phone ?? ""
  };

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <PageIntro eyebrow="Settings" title="Caregiver settings" body="Choose the person who should receive plain English alerts if a sustained change is noticed." />
        <CaregiverSettingsForm defaults={defaults} />
      </div>
    </main>
  );
}
