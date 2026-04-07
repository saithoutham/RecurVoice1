import { PageIntro } from "@/components/PageIntro";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { getCurrentUser } from "@/lib/server/current-user";

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const defaults = {
    full_name: user.profile.full_name,
    date_of_birth: user.profile.date_of_birth ?? "",
    diagnosis_stage: user.profile.diagnosis_stage ?? "",
    treatment_type: user.profile.treatment_type ?? "",
    treatment_start_date: user.profile.treatment_start_date ?? "",
    oncologist_name: user.profile.oncologist_name ?? "",
    oncologist_email: user.profile.oncologist_email ?? ""
  };

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <PageIntro eyebrow="Settings" title="Profile settings" body="Edit your name, treatment information, and oncology contacts." />
        <ProfileSettingsForm defaults={defaults} />
      </div>
    </main>
  );
}
