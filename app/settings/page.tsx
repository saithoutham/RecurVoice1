import Link from "next/link";

import { PageIntro } from "@/components/PageIntro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/settings/profile", title: "Profile", body: "Update your name, diagnosis information, and treatment details." },
  { href: "/settings/caregiver", title: "Caregiver", body: "Change who gets notified if RecurVoice notices a sustained change." },
  { href: "/settings/notifications", title: "Notifications", body: "Choose when reminder and summary emails are sent." },
  { href: "/settings/data", title: "Data", body: "Download your information or delete your account." }
];

export default function SettingsPage() {
  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <PageIntro eyebrow="Settings" title="Manage your account" body="Choose a section below to update your profile, caregiver, notifications, or data controls." />
        <div className="grid gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="transition hover:border-[#1B4332]/30">
                <CardHeader><CardTitle className="text-2xl">{link.title}</CardTitle></CardHeader>
                <CardContent><p className="text-lg leading-8 text-[#4B5563]">{link.body}</p></CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
