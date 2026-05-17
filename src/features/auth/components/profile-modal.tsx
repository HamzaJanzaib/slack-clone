"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Camera } from "lucide-react"

type ProfileModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

function getInitials(name?: string | null, email?: string | null): string {
    if (name) {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }
    if (email) {
        return email[0].toUpperCase()
    }
    return "?"
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
    const currentUser = useQuery(api.users.currentUser)
    const updateProfile = useMutation(api.users.updateProfile)

    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Sync form state when user data loads
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name ?? "")
            setPhone(currentUser.phone ?? "")
        }
    }, [currentUser])

    // Reset saved state when modal opens
    useEffect(() => {
        if (open) {
            setSaved(false)
        }
    }, [open])

    if (!currentUser) return null

    const initials = getInitials(currentUser.name, currentUser.email)
    const displayEmail = currentUser.email ?? ""

    const handleSave = async () => {
        setIsSaving(true)
        setSaved(false)
        try {
            await updateProfile({
                name: name.trim() || undefined,
                phone: phone.trim() || undefined,
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } finally {
            setIsSaving(false)
        }
    }

    const hasChanges =
        (name.trim() || "") !== (currentUser.name ?? "") ||
        (phone.trim() || "") !== (currentUser.phone ?? "")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md shadow-shopify-card">
                <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                    <DialogDescription>
                        View and update your profile information
                    </DialogDescription>
                </DialogHeader>

                <Separator />

                {/* Avatar section */}
                <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer">
                        <Avatar size="lg">
                            {currentUser.image && (
                                <AvatarImage
                                    src={currentUser.image}
                                    alt={currentUser.name ?? "User"}
                                />
                            )}
                            <AvatarFallback className="text-base">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <Camera className="size-4 text-white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-medium">
                            {currentUser.name || "No name set"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {displayEmail}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Editable fields */}
                <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="profile-name">Name</Label>
                        <Input
                            id="profile-name"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-[var(--shopify-input-border)] shadow-shopify-input focus:shadow-shopify-input-focus"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="profile-email">Email</Label>
                        <Input
                            id="profile-email"
                            value={displayEmail}
                            disabled
                            className="border-[var(--shopify-input-border)] opacity-60"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="profile-phone">Phone</Label>
                        <Input
                            id="profile-phone"
                            placeholder="Your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="border-[var(--shopify-input-border)] shadow-shopify-input focus:shadow-shopify-input-focus"
                        />
                    </div>
                </div>

                <DialogFooter>
                    {saved && (
                        <p className="mr-auto text-sm text-green-600">
                            Saved!
                        </p>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className="cursor-pointer"
                    >
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
