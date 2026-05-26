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
import { useParams, usePathname, useRouter } from "next/navigation"
import { ProfileModal } from "@/features/auth/components/profile-modal"
import { SettingsModal } from "@/features/auth/components/settings-modal"
import { WorkspaceMenu } from "@/features/workspaces/components/workspace-menu"
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal"
import { useCreateWorkspaceModel } from "@/features/workspaces/store/use-create-workspaces-create-model"
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces"
import { Id } from "../../../../convex/_generated/dataModel"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
    size?: "default" | "sm" | "lg"
    variant?: "default" | "toolbar" | "sidebar"
    className?: string
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

export function UserAvatar({
    size = "default",
    variant = "default",
    className,
}: UserAvatarProps = {}) {
    const currentUser = useQuery(api.users.currentUser)
    const { signOut } = useAuthActions()
    const router = useRouter()
    const params = useParams()
    const pathname = usePathname()
    const { isOpen: createWorkspaceOpen, setIsOpen: setCreateWorkspaceOpen } =
        useCreateWorkspaceModel()
    const { data: workspaces } = useGetWorkspaces()
    const hasWorkspaces = (workspaces?.length ?? 0) > 0
    const isJoinFlow = pathname?.startsWith("/join/")

    const currentWorkspaceId = params?.workspaceId as
        | Id<"workspaces">
        | undefined

    const [profileOpen, setProfileOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)

    const isToolbar = variant === "toolbar"
    const isSidebar = variant === "sidebar"
    const avatarSize = isToolbar || isSidebar ? "sm" : size

    // Loading state
    if (currentUser === undefined) {
        return (
            <Skeleton
                className={cn(
                    isToolbar && "size-8 rounded-md bg-sidebar-accent",
                    isSidebar && "size-9 rounded-lg bg-sidebar-accent",
                    !isToolbar && !isSidebar && "size-8 rounded-full",
                    className,
                )}
            />
        )
    }

    // Not authenticated (shouldn't happen on protected pages, but safe fallback)
    if (currentUser === null) {
        return null
    }

    const initials = getInitials(currentUser.name, currentUser.email)
    const displayName = currentUser.name || currentUser.email || "User"
    const displayEmail = currentUser.email || ""

    if (isSidebar) {
        return (
            <>
                <button
                    type="button"
                    id="user-avatar-trigger"
                    aria-label="Open profile"
                    onClick={() => setProfileOpen(true)}
                    className={cn(
                        "flex size-9 cursor-pointer items-center justify-center rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
                        className,
                    )}
                >
                    <span className="relative size-8 shrink-0">
                        <Avatar
                            size={avatarSize}
                            className="size-8 rounded-full after:hidden **:data-[slot=avatar-fallback]:bg-primary **:data-[slot=avatar-fallback]:text-primary-foreground"
                        >
                            {currentUser.image && (
                                <AvatarImage
                                    src={currentUser.image}
                                    alt={displayName}
                                />
                            )}
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span
                            aria-hidden
                            className="absolute right-0 bottom-0 size-2.5 translate-x-1/4 translate-y-1/4 rounded-full border-2 border-sidebar bg-emerald-500"
                        />
                    </span>
                </button>

                <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
                <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
                <CreateWorkspaceModal
                    open={createWorkspaceOpen}
                    onOpenChange={setCreateWorkspaceOpen}
                    required={
                        workspaces !== undefined && !hasWorkspaces && !isJoinFlow
                    }
                />
            </>
        )
    }

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
                        className={cn(
                            "relative cursor-pointer outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-1",
                            isToolbar
                                ? "flex size-8 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent p-0.5 focus-visible:ring-sidebar-ring focus-visible:ring-offset-sidebar"
                                : "rounded-full ring-offset-background hover:opacity-80 focus-visible:ring-ring focus-visible:ring-offset-2",
                            className,
                        )}
                    >
                        <Avatar
                            size={avatarSize}
                            className={cn(
                                isToolbar &&
                                    "size-7 after:hidden **:data-[slot=avatar-fallback]:bg-sidebar-accent **:data-[slot=avatar-fallback]:text-sidebar-foreground",
                            )}
                        >
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
                <DropdownMenuContent align="end" className="w-64">
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
                    <WorkspaceMenu currentWorkspaceId={currentWorkspaceId} />
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
            <CreateWorkspaceModal
                open={createWorkspaceOpen}
                onOpenChange={setCreateWorkspaceOpen}
                required={
                    workspaces !== undefined && !hasWorkspaces && !isJoinFlow
                }
            />
        </>
    )
}
