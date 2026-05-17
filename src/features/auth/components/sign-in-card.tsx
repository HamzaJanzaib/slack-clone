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
    validateSignInForm,
} from "@/features/auth/lib/validation"
import { signInFlow } from "@/features/auth/types"
import Link from "next/link"
import { FaGithub, FaGoogle } from "react-icons/fa"

type SignInCardProps = {
    setStatus: (status: signInFlow) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
}

export function SignInCard({ setStatus, isLoading, setIsLoading }: SignInCardProps) {
    const { signIn } = useAuthActions()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
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
        const validationErrors = validateSignInForm(email, password)
        setErrors(validationErrors)
        if (hasAuthErrors(validationErrors)) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.set("email", email)
            formData.set("password", password)
            formData.set("flow", "signIn")
            await signIn("password", formData)
        } catch {
            setErrors({ email: "Invalid email or password" })
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
                    <CardTitle className="text-2xl font-bold tracking-tight">Log in</CardTitle>
                    <CardDescription className="text-[#616161]">
                        Continue to your workspace
                    </CardDescription>
                    <CardAction>
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => setStatus("signUp")}
                            disabled={isLoading}
                        >
                            Sign Up
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
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
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="ml-auto inline-block cursor-pointer text-sm text-(--shopify-link) underline-offset-4 hover:text-(--shopify-link-hover) hover:underline"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <PasswordInput
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value)
                                    clearError("password")
                                }}
                                aria-invalid={!!errors.password}
                                disabled={isLoading}
                                required
                            />
                            <FieldError message={errors.password} />
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
