"use client"

import { useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { AuthOrDivider } from "@/features/auth/components/auth-or-divider"
import { FieldError } from "@/features/auth/components/field-error"
import {
    AuthFieldErrors,
    hasAuthErrors,
    validateSignUpForm,
} from "@/features/auth/lib/validation"
import { signInFlow } from "@/features/auth/types"
import { FaGithub, FaGoogle } from "react-icons/fa"

type SignUpCardProps = {
    setStatus: (status: signInFlow) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
}

const SignUpCard = ({ setStatus, isLoading, setIsLoading }: SignUpCardProps) => {
    const { signIn } = useAuthActions()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState<AuthFieldErrors>({})

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
        const validationErrors = validateSignUpForm(email, password, confirmPassword)
        setErrors(validationErrors)
        if (hasAuthErrors(validationErrors)) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.set("email", email)
            formData.set("password", password)
            formData.set("flow", "signUp")
            await signIn("password", formData)
        } catch {
            setErrors({ email: "Could not create account. Try a different email." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOAuth = async (provider: "google" | "github") => {
        setIsLoading(true)
        try {
            await signIn(provider, { redirectTo: "/" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Card className="w-full max-w-[400px]">
                <CardHeader className="gap-1.5 pb-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create account</CardTitle>
                    <CardDescription className="text-[#616161]">
                        Continue to your workspace
                    </CardDescription>
                    <CardAction>
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => setStatus("signIn")}
                            disabled={isLoading}
                        >
                            Sign In
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <Input
                                id="signup-email"
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
                            <Label htmlFor="signup-password">Password</Label>
                            <PasswordInput
                                id="signup-password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value)
                                    clearError("password")
                                    if (errors.confirmPassword) {
                                        clearError("confirmPassword")
                                    }
                                }}
                                aria-invalid={!!errors.password}
                                disabled={isLoading}
                                required
                            />
                            <FieldError message={errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                            <PasswordInput
                                id="signup-confirm-password"
                                placeholder="Re-enter your password"
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
                        {isLoading ? "Continuing..." : "Continue with email"}
                    </Button>
                    <AuthOrDivider />
                    <div className="flex w-full flex-col gap-2">
                        <Button
                            type="button"
                            variant="soft"
                            className="w-full"
                            disabled={isLoading}
                            onClick={() => handleOAuth("google")}
                        >
                            <FaGoogle className="mr-2 size-4" />
                            Continue with Google
                        </Button>
                        <Button
                            type="button"
                            variant="soft"
                            className="w-full"
                            disabled={isLoading}
                            onClick={() => handleOAuth("github")}
                        >
                            <FaGithub className="mr-2 size-4" />
                            Continue with Github
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    )
}

export default SignUpCard
