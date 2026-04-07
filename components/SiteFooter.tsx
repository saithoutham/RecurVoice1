import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-8 text-base text-[#4B5563] md:flex-row md:items-center md:justify-between">
        <div>
          <p>RecurVoice is a research-stage wellness monitoring tool. It does not diagnose medical conditions.</p>
          <p className="mt-1">Contact: contact@recurvoice.example</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="font-semibold text-[#1B4332]">
            Terms
          </Link>
          <Link href="/privacy" className="font-semibold text-[#1B4332]">
            Privacy
          </Link>
          <Link href="/guide" className="font-semibold text-[#1B4332]">
            Guide
          </Link>
        </div>
      </div>
    </footer>
  );
}
