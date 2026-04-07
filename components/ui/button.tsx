import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-16 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#1B4332] px-6 py-4 text-white hover:bg-[#143628]",
        outline: "border border-[#E5E7EB] bg-white px-6 py-4 text-[#0A0A0A] hover:border-[#1B4332]/30 hover:bg-[#F9FAFB]",
        ghost: "min-h-auto px-3 py-2 text-base text-[#1B4332] hover:bg-[#F9FAFB]",
        danger: "bg-[#991B1B] px-6 py-4 text-white hover:bg-[#7F1D1D]"
      },
      size: {
        default: "",
        sm: "min-h-12 px-4 py-3 text-base",
        lg: "min-h-16 px-8 py-4 text-xl",
        icon: "h-12 min-h-12 w-12 rounded-full p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
