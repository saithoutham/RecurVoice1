import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-16 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-lg text-[#0A0A0A] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
