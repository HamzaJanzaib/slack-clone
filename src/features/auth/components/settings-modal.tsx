"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useAction } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PasswordInput } from "@/components/ui/password-input"
import { FieldError } from "@/features/auth/components/field-error"
import { Lock, Monitor, Moon, Sun } from "lucide-react"

type SettingsModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    const changePassword = useAction(api.users.changePassword)
    const { theme, setTheme } = useTheme()

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    const resetForm = () => {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setErrors({})
        setSuccess(false)
    }

    const handleOpenChange = (value: boolean) => {
        if (!value) {
            resetForm()
        }
        onOpenChange(value)
    }

    const validatePasswordChange = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!currentPassword) {
            newErrors.currentPassword = "Current password is required"
        }
        if (!newPassword) {
            newErrors.newPassword = "New password is required"
        } else if (newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters"
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your new password"
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChangePassword = async () => {
        if (!validatePasswordChange()) return

        setIsSaving(true)
        setSuccess(false)
        setErrors({})

        try {
            await changePassword({
                currentPassword,
                newPassword,
            })

            setSuccess(true)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setTimeout(() => setSuccess(false), 3000)
        } catch (error: any) {
            const message = error?.message || ""
            if (message.includes("Incorrect current password")) {
                setErrors({
                    currentPassword: "Incorrect current password.",
                })
            } else {
                setErrors({
                    currentPassword: "Failed to change password. Please try again.",
                })
            }
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md shadow-shopify-card">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Manage your account settings
                    </DialogDescription>
                </DialogHeader>

                <Separator />

                {/* Theme Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Sun className="size-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Appearance</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {themeOptions.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setTheme(value)}
                                className={`
                                    flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm transition-all
                                    ${
                                        theme === value
                                            ? "border-primary bg-primary/5 text-primary shadow-shopify-input-focus"
                                            : "border-(--shopify-input-border) text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                                    }
                                `}
                            >
                                <Icon className="size-5" />
                                <span className="text-xs font-medium">
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Change Password Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Lock className="size-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">
                            Change Password
                        </h3>
                    </div>

                    <div className="grid gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="settings-current-password">
                                Current Password
                            </Label>
                            <PasswordInput
                                id="settings-current-password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value)
                                    setErrors((prev) => {
                                        const next = { ...prev }
                                        delete next.currentPassword
                                        return next
                                    })
                                }}
                                className="border-(--shopify-input-border) shadow-shopify-input focus:shadow-shopify-input-focus"
                            />
                            <FieldError message={errors.currentPassword} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="settings-new-password">
                                New Password
                            </Label>
                            <PasswordInput
                                id="settings-new-password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value)
                                    setErrors((prev) => {
                                        const next = { ...prev }
                                        delete next.newPassword
                                        return next
                                    })
                                }}
                                className="border-(--shopify-input-border) shadow-shopify-input focus:shadow-shopify-input-focus"
                            />
                            <FieldError message={errors.newPassword} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="settings-confirm-password">
                                Confirm New Password
                            </Label>
                            <PasswordInput
                                id="settings-confirm-password"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value)
                                    setErrors((prev) => {
                                        const next = { ...prev }
                                        delete next.confirmPassword
                                        return next
                                    })
                                }}
                                className="border-(--shopify-input-border) shadow-shopify-input focus:shadow-shopify-input-focus"
                            />
                            <FieldError message={errors.confirmPassword} />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    {success && (
                        <p className="mr-auto text-sm text-green-600">
                            Password updated!
                        </p>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        className="cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleChangePassword}
                        disabled={
                            isSaving ||
                            !currentPassword ||
                            !newPassword ||
                            !confirmPassword
                        }
                        className="cursor-pointer"
                    >
                        {isSaving ? "Updating..." : "Update password"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
