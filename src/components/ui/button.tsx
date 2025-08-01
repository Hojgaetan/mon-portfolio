import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Nouvelles variantes avec les couleurs d'accent
        "accent-red": "bg-accent-red text-white hover:bg-accent-red/90 active:bg-accent-red/80",
        "accent-blue": "bg-accent-blue text-white hover:bg-accent-blue/90 active:bg-accent-blue/80",
        "accent-sky": "bg-accent-sky text-white hover:bg-accent-sky/90 active:bg-accent-sky/80",
        "accent-green": "bg-accent-green text-gray-900 hover:bg-accent-green/90 active:bg-accent-green/80",
        "accent-yellow": "bg-accent-yellow text-gray-900 hover:bg-accent-yellow/90 active:bg-accent-yellow/80",
        // Variantes outline avec les couleurs d'accent
        "outline-red": "border-2 border-accent-red text-accent-red bg-transparent hover:bg-accent-red hover:text-white",
        "outline-blue": "border-2 border-accent-blue text-accent-blue bg-transparent hover:bg-accent-blue hover:text-white",
        "outline-sky": "border-2 border-accent-sky text-accent-sky bg-transparent hover:bg-accent-sky hover:text-white",
        "outline-green": "border-2 border-accent-green text-accent-green bg-transparent hover:bg-accent-green hover:text-gray-900",
        "outline-yellow": "border-2 border-accent-yellow text-accent-yellow bg-transparent hover:bg-accent-yellow hover:text-gray-900",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
