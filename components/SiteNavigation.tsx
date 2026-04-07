"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  authenticated?: boolean;
  onboardingComplete?: boolean;
  unacknowledgedAlertCount?: number;
};

const authLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/checkin", label: "Check-in" },
  { href: "/weekly-history", label: "Weekly" },
  { href: "/progress", label: "Progress" },
  { href: "/trends", label: "Trends" },
  { href: "/scores", label: "Scores" },
  { href: "/compare", label: "Compare" },
  { href: "/recurvoice-ai", label: "RecurVoice AI" }
];

export function SiteNavigation({
  authenticated,
  onboardingComplete,
  unacknowledgedAlertCount
}: Props) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const compact = pathname.startsWith("/checkin") || pathname.startsWith("/demo");

  const navLinks = authLinks;

  return (
    <header className="border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4">
        <Link href="/dashboard" className="text-2xl font-semibold text-[#1B4332]">
          RecurVoice
        </Link>

        {!compact ? (
          <>
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-lg font-medium text-[#4B5563] transition hover:text-[#1B4332]",
                    pathname === link.href && "text-[#1B4332]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <span className="rounded-full border border-[#D1FAE5] bg-[#F0FDF4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1B4332]">
                Demo
              </span>
            </div>

            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#E5E7EB] md:hidden"
                >
                  <Menu className="h-5 w-5 text-[#1B4332]" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/20" />
                <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-[320px] border-l border-[#E5E7EB] bg-white p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold text-[#1B4332]">Menu</p>
                    <button type="button" onClick={() => setOpen(false)} className="text-base text-[#4B5563]">
                      Close
                    </button>
                  </div>
                  <div className="mt-8 space-y-3">
                    {authLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl border border-[#E5E7EB] px-4 py-4 text-lg font-semibold text-[#0A0A0A]"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#1B4332]">
                      Demo Mode
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        ) : (
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
            Daily voice check-in
          </div>
        )}
      </div>
    </header>
  );
}
