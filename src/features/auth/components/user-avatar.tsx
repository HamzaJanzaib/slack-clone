"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { api } from "../../../../convex/_generated/api"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProfileModal } from "@/features/auth/components/profile-modal"
import { SettingsModal } from "@/features/auth/components/settings-modal"

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

export function UserAvatar() {
    const currentUser = useQuery(api.users.currentUser)
    const { signOut } = useAuthActions()
    const router = useRouter()

    const [profileOpen, setProfileOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)

    // Loading state
    if (currentUser === undefined) {
        return <Skeleton className="size-8 rounded-full" />
    }

    // Not authenticated (shouldn't happen on protected pages, but safe fallback)
    if (currentUser === null) {
        return null
    }

    const initials = getInitials(currentUser.name, currentUser.email)
    const displayName = currentUser.name || currentUser.email || "User"
    const displayEmail = currentUser.email || ""

    const handleSignOut = async () => {
        await signOut()
        router.push("/auth")
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        id="user-avatar-trigger"
                        className="relative cursor-pointer rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <Avatar size="default">
                            {currentUser.image && (
                                <AvatarImage
                                    src={currentUser.image}
                                    alt={displayName}
                                />
                            )}
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium leading-none">
                                {displayName}
                            </p>
                            {displayEmail && (
                                <p className="text-xs leading-none text-muted-foreground">
                                    {displayEmail}
                                </p>
                            )}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            id="user-menu-profile"
                            className="cursor-pointer"
                            onClick={() => setProfileOpen(true)}
                        >
                            <User className="mr-2 size-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            id="user-menu-settings"
                            className="cursor-pointer"
                            onClick={() => setSettingsOpen(true)}
                        >
                            <Settings className="mr-2 size-4" />
                            Settings
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        id="user-menu-logout"
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={handleSignOut}
                    >
                        <LogOut className="mr-2 size-4" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
    )
}
