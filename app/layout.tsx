export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavigation } from "@/components/SiteNavigation";
import { getCurrentDashboardSummary, getCurrentUser } from "@/lib/server/current-user";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "RecurVoice",
  description:
    "Interactive browser demo for RecurVoice voice monitoring and clinician review."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser();
  const summary = await getCurrentDashboardSummary();

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white font-[var(--font-body)] text-[#0A0A0A] antialiased">
        <SiteNavigation
          authenticated={Boolean(user)}
          onboardingComplete={Boolean(user?.profile.onboarding_complete)}
          unacknowledgedAlertCount={
            (summary?.unacknowledgedAlerts.length ?? 0) +
            (summary?.unacknowledgedConvergenceAlerts.length ?? 0)
          }
        />
        <div className="min-h-[calc(100vh-141px)]">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
