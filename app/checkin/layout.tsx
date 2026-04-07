import type { ReactNode } from "react";

import { CheckinShell } from "@/components/CheckinShell";

export default function CheckinLayout({ children }: { children: ReactNode }) {
  return <CheckinShell>{children}</CheckinShell>;
}
