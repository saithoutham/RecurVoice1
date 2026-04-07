import { Badge } from "@/components/ui/badge";
import { alertVariant } from "@/lib/metrics";

export function AlertLevelBadge({ level }: { level: string | null }) {
  const variant = alertVariant(level);
  return <Badge variant={variant}>{level ?? "STABLE"}</Badge>;
}
