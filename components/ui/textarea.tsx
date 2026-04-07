import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-40 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-lg leading-8 text-[#0A0A0A] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
