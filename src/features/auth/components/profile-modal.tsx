"use client"

import { useState, useEffect, useRef } from "react"
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
import { Camera, Loader2 } from "lucide-react"

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
    const generateUploadUrl = useMutation(api.upload.generateUploadUrl)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [selectedStorageId, setSelectedStorageId] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Sync form state when user data loads
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name ?? "")
            setPhone(currentUser.phone ?? "")
            setPreviewImage(currentUser.image ?? null)
            setSelectedStorageId(null)
        }
    }, [currentUser])

    // Reset saved/upload state when modal opens
    useEffect(() => {
        if (open) {
            setSaved(false)
            setIsUploading(false)
        }
    }, [open])

    if (!currentUser) return null

    const initials = getInitials(currentUser.name, currentUser.email)
    const displayEmail = currentUser.email ?? ""

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        // Instantly show local image preview
        const localPreview = URL.createObjectURL(file)
        setPreviewImage(localPreview)

        try {
            // 1. Get temporary upload URL
            const postUrl = await generateUploadUrl()

            // 2. Upload file to Convex storage
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            })

            if (!result.ok) throw new Error("Upload failed")

            const { storageId } = await result.json()
            setSelectedStorageId(storageId)
        } catch (error) {
            console.error("Error uploading image:", error)
            setPreviewImage(currentUser.image ?? null)
            alert("Failed to upload image. Please try again.")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaved(false)
        try {
            await updateProfile({
                name: name.trim() || undefined,
                phone: phone.trim() || undefined,
                ...(selectedStorageId && { storageId: selectedStorageId }),
            })
            setSaved(true)
            setSelectedStorageId(null)
            setTimeout(() => setSaved(false), 2000)
        } finally {
            setIsSaving(false)
        }
    }

    const hasChanges =
        (name.trim() || "") !== (currentUser.name ?? "") ||
        (phone.trim() || "") !== (currentUser.phone ?? "") ||
        selectedStorageId !== null

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

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading || isSaving}
                />

                {/* Avatar section */}
                <div className="flex items-center gap-4">
                    <div
                        onClick={handleAvatarClick}
                        className="relative group cursor-pointer rounded-full overflow-hidden transition-opacity hover:opacity-90"
                    >
                        <Avatar size="lg">
                            {previewImage && (
                                <AvatarImage
                                    src={previewImage}
                                    alt={currentUser.name ?? "User"}
                                />
                            )}
                            <AvatarFallback className="text-base">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            {isUploading ? (
                                <Loader2 className="size-4 animate-spin text-white" />
                            ) : (
                                <Camera className="size-4 text-white" />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-medium">
                            {currentUser.name || "No name set"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {displayEmail}
                        </p>
                        {isUploading && (
                            <p className="text-[10px] text-primary animate-pulse mt-0.5">
                                Uploading image...
                            </p>
                        )}
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
                            className="border-(--shopify-input-border) shadow-shopify-input focus:shadow-shopify-input-focus"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="profile-email">Email</Label>
                        <Input
                            id="profile-email"
                            value={displayEmail}
                            disabled
                            className="border-(--shopify-input-border) opacity-60"
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
                            className="border-(--shopify-input-border) shadow-shopify-input focus:shadow-shopify-input-focus"
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
                        disabled={isUploading || isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isUploading || isSaving || !hasChanges}
                        className="cursor-pointer"
                    >
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
