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
import { FieldError } from "@/features/auth/components/field-error"
import { requestPasswordReset } from "@/features/auth/actions/auth-actions"
import {
  AuthFieldErrors,
  hasAuthErrors,
  validateForgotPasswordForm,
} from "@/features/auth/lib/validation"

type ForgotPasswordCardProps = {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ForgotPasswordCard({ isLoading, setIsLoading }: ForgotPasswordCardProps) {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<AuthFieldErrors>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

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
    const validationErrors = validateForgotPasswordForm(email)
    setErrors(validationErrors)
    if (hasAuthErrors(validationErrors)) return

    setIsLoading(true)
    try {
      await requestPasswordReset({ email })
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="w-full max-w-[400px]">
        <CardHeader className="gap-1.5 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Forgot password?
          </CardTitle>
          <CardDescription className="text-[#616161]">
            {isSubmitted
              ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."
              : "Enter the email associated with your account and we'll send you a reset link."}
          </CardDescription>
        </CardHeader>
        {!isSubmitted ? (
          <>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
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
            </CardContent>
            <CardFooter className="flex-col gap-3 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
              <p className="text-center text-sm text-[#616161]">
                Remember your password?{" "}
                <Link
                  href="/"
                  className="text-[var(--shopify-link)] hover:text-[var(--shopify-link-hover)] hover:underline"
                >
                  Back to log in
                </Link>
              </p>
            </CardFooter>
          </>
        ) : (
          <CardFooter className="flex-col gap-3 pt-2">
            <Button type="button" className="w-full" asChild>
              <Link href="/">Back to log in</Link>
            </Button>
            <Button
              type="button"
              variant="soft"
              className="w-full"
              disabled={isLoading}
              onClick={() => {
                setIsSubmitted(false)
                setEmail("")
                setErrors({})
              }}
            >
              Send another link
            </Button>
          </CardFooter>
        )}
      </Card>
    </form>
  )
}
