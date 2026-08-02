import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[2px] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold drop-shadow-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.39),inset_0_1px_0_rgba(255,255,255,0.3)] border border-blue-700 hover:brightness-110 active:shadow-[inset_0_3px_7px_rgba(0,0,0,0.3)]",
        destructive:
          "bg-red-600 bg-gradient-to-b from-red-500 to-red-700 text-white font-bold drop-shadow-sm shadow-[0_4px_14px_0_rgba(220,38,38,0.39),inset_0_1px_0_rgba(255,255,255,0.3)] border border-red-700 hover:brightness-110 active:shadow-[inset_0_3px_7px_rgba(0,0,0,0.3)]",
        outline:
          "border-2 border-input bg-gradient-to-b from-background to-muted/20 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:bg-accent hover:text-accent-foreground active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]",
        secondary:
          "bg-gradient-to-b from-secondary/80 to-secondary text-secondary-foreground shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-secondary/20 hover:brightness-105 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
