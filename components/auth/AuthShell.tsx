import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({
  title,
  body,
  footer,
  children
}: {
  title: string;
  body: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-141px)] bg-[#F9FAFB] px-4 py-12">
      <div className="mx-auto flex max-w-[480px] flex-col gap-6">
        <Link href="/" className="text-center text-lg font-semibold text-[#1B4332]">
          RecurVoice
        </Link>
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-4xl">{title}</CardTitle>
            <CardDescription>{body}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        {footer ? <div className="text-center text-base text-[#4B5563]">{footer}</div> : null}
      </div>
    </main>
  );
}
