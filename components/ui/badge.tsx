import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        stable: "border-green-200 bg-green-50 text-green-700",
        watch: "border-amber-200 bg-amber-50 text-amber-700",
        early: "border-orange-200 bg-orange-50 text-orange-700",
        urgent: "border-red-200 bg-red-50 text-red-700",
        neutral: "border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
