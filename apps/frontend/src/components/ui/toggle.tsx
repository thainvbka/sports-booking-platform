import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-10 px-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

type ToggleProps = Omit<React.ComponentProps<"button">, "onChange"> &
  VariantProps<typeof toggleVariants> & {
    pressed?: boolean
    defaultPressed?: boolean
    onPressedChange?: (pressed: boolean) => void
  }

function Toggle({
  className,
  variant,
  size,
  pressed,
  defaultPressed = false,
  onPressedChange,
  onClick,
  type = "button",
  ...props
}: ToggleProps) {
  const [internalPressed, setInternalPressed] = React.useState(defaultPressed)
  const isControlled = typeof pressed === "boolean"
  const currentPressed = isControlled ? pressed : internalPressed

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    const nextPressed = !currentPressed
    if (!isControlled) {
      setInternalPressed(nextPressed)
    }
    onPressedChange?.(nextPressed)
  }

  return (
    <button
      type={type}
      aria-pressed={currentPressed}
      data-state={currentPressed ? "on" : "off"}
      className={cn(toggleVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    />
  )
}

export { Toggle }

