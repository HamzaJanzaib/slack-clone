"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

function PasswordInput({
  className,
  placeholder = "Enter your password",
  ...props
}: React.ComponentProps<typeof Input>) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
        disabled={props.disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setShowPassword((visible) => !visible)}
        className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="relative block size-4">
          <Eye
            className={cn(
              "absolute inset-0 size-4 transition-opacity duration-150",
              showPassword ? "opacity-0" : "opacity-100"
            )}
          />
          <EyeOff
            className={cn(
              "absolute inset-0 size-4 transition-opacity duration-150",
              showPassword ? "opacity-100" : "opacity-0"
            )}
          />
        </span>
      </button>
    </div>
  )
}

export { PasswordInput }
