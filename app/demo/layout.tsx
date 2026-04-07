import type { ReactNode } from "react";

import { DemoShell } from "@/components/DemoShell";

export default function DemoLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <DemoShell>{children}</DemoShell>;
}
