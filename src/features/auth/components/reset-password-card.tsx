"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { FieldError } from "@/features/auth/components/field-error"
import { useAuthActions } from "@convex-dev/auth/react"
import {
  AuthFieldErrors,
  hasAuthErrors,
  validateEmail,
  validateResetPasswordForm,
} from "@/features/auth/lib/validation"

type ResetPasswordCardProps = {
  code: string | null
  email: string | null
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ResetPasswordCard({
  code: initialCode,
  email: initialEmail,
  isLoading,
  setIsLoading,
}: ResetPasswordCardProps) {
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState(initialEmail ?? "")
  const [code, setCode] = useState(initialCode ?? "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<AuthFieldErrors>({})
  const [isSuccess, setIsSuccess] = useState(false)

  const clearError = (field: keyof AuthFieldErrors) => {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateResetPasswordForm(password, confirmPassword)
    const emailError = validateEmail(email)
    if (emailError) validationErrors.email = emailError
    if (!code.trim()) {
      validationErrors.code = "Reset code is required"
    }
    setErrors(validationErrors)
    if (hasAuthErrors(validationErrors)) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.set("email", email)
      formData.set("code", code)
      formData.set("newPassword", password)
      formData.set("flow", "reset-verification")
      await signIn("password", formData)
      setIsSuccess(true)
    } catch {
      setErrors({
        password: "Invalid code or password. Check your email and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-[400px]">
        <CardHeader className="gap-1.5 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Password updated
          </CardTitle>
          <CardDescription className="text-[#616161]">
            Your password has been reset successfully. You can now log in with your
            new password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <Button type="button" className="w-full" asChild>
            <Link href="/">Continue to log in</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="w-full max-w-[400px]">
        <CardHeader className="gap-1.5 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Reset password
          </CardTitle>
          <CardDescription className="text-[#616161]">
            Enter the code from your email and choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  clearError("email")
                }}
                aria-invalid={!!errors.email}
                disabled={isLoading}
                required
              />
              <FieldError message={errors.email} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reset-code">Reset code</Label>
              <Input
                id="reset-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="8-digit code from email"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value)
                  clearError("code")
                }}
                aria-invalid={!!errors.code}
                disabled={isLoading}
                required
              />
              <FieldError message={errors.code} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reset-password">New password</Label>
              <PasswordInput
                id="reset-password"
                placeholder="Create a new password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearError("password")
                  if (errors.confirmPassword) clearError("confirmPassword")
                }}
                aria-invalid={!!errors.password}
                disabled={isLoading}
                required
              />
              <FieldError message={errors.password} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reset-confirm-password">Confirm password</Label>
              <PasswordInput
                id="reset-confirm-password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  clearError("confirmPassword")
                }}
                aria-invalid={!!errors.confirmPassword}
                disabled={isLoading}
                required
              />
              <FieldError message={errors.confirmPassword} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3 pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Reset password"}
          </Button>
          <p className="text-center text-sm text-[#616161]">
            <Link
              href="/"
              className="text-[var(--shopify-link)] hover:text-[var(--shopify-link-hover)] hover:underline"
            >
              Back to log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  )
}
