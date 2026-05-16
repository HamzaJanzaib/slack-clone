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
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { FieldError } from "@/features/auth/components/field-error"
import { resetPassword } from "@/features/auth/actions/auth-actions"
import {
  AuthFieldErrors,
  hasAuthErrors,
  validateResetPasswordForm,
} from "@/features/auth/lib/validation"

type ResetPasswordCardProps = {
  token: string | null
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ResetPasswordCard({
  token,
  isLoading,
  setIsLoading,
}: ResetPasswordCardProps) {
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
    if (!token) return

    const validationErrors = validateResetPasswordForm(password, confirmPassword)
    setErrors(validationErrors)
    if (hasAuthErrors(validationErrors)) return

    setIsLoading(true)
    try {
      await resetPassword({ token, password })
      setIsSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-[400px]">
        <CardHeader className="gap-1.5 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Invalid reset link
          </CardTitle>
          <CardDescription className="text-[#616161]">
            This password reset link is invalid or has expired. Request a new link
            to continue.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-3 pt-2">
          <Button type="button" className="w-full" asChild>
            <Link href="/forgot-password">Request new link</Link>
          </Button>
          <Button type="button" variant="soft" className="w-full" asChild>
            <Link href="/">Back to log in</Link>
          </Button>
        </CardFooter>
      </Card>
    )
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
            Enter a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
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
