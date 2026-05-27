"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import {
    ChevronDown,
    Compass,
    Contact,
    Hash,
    Headphones,
    LayoutGrid,
    MessageSquare,
    Plus,
    Settings,
    SquarePen,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import {
    markWorkspaceSetupSeen,
    useWorkspaceUi,
} from "@/features/workspaces/context/workspace-ui-context";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { WorkspaceSettingsModal } from "@/features/workspaces/components/workspace-settings-modal";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "../../../../convex/_generated/dataModel";
import { BotLogo } from "@/features/workspaces/components/bot-logo";
import { channelTabId } from "@/features/workspaces/lib/workspace-tab";
import { cn } from "@/lib/utils";

const channels = [
    { id: "all", name: "all-testing" },
    { id: "new", name: "new-channel" },
    { id: "social", name: "social" },
] as const;

const dmUsers = [{ id: "hbahi024", name: "hbahi024", initials: "hb" }] as const;

function SectionHeader({
    title,
    icon,
}: {
    title: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="mx-2 flex items-center gap-1.5 px-2 py-1 text-[13px] font-semibold text-sidebar-foreground/70">
            {icon}
            <span>{title}</span>
        </div>
    );
}

function SidebarNavItem({
    label,
    icon,
    isActive,
    onClick,
    suffix,
    badge,
    className,
}: {
    label: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    onClick?: () => void;
    suffix?: string;
    badge?: number;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "mx-2 flex w-[calc(100%-1rem)] cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left text-[15px] outline-none",
                isActive
                    ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/90 hover:bg-sidebar-accent",
                className,
            )}
        >
            {icon}
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {suffix && (
                <span className="shrink-0 text-[13px] text-sidebar-foreground/50">
                    {suffix}
                </span>
            )}
            {badge !== undefined && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-semibold text-sidebar-primary-foreground">
                    {badge}
                </span>
            )}
        </button>
    );
}

function DmAvatar({
    initials,
    variant = "default",
}: {
    initials: string;
    variant?: "default" | "self";
}) {
    return (
        <span
            className={cn(
                "flex size-5 shrink-0 items-center justify-center overflow-hidden rounded text-[10px] font-semibold",
                variant === "self"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
            )}
        >
            {initials.slice(0, 2).toUpperCase()}
        </span>
    );
}

export function ChannelSidebar() {
    const params = useParams();
    const workspaceId = params?.workspaceId as Id<"workspaces"> | undefined;
    const { data: workspace, isLoading } = useGetWorkspace(workspaceId);
    const updateWorkspace = useUpdateWorkspace();
    const currentUser = useQuery(api.users.currentUser);
    const { tab, setTab, setChannelSidebarOpen } = useWorkspaceUi();
    const inlineNameInputRef = useRef<HTMLInputElement>(null);
    const [isRenamingInline, setIsRenamingInline] = useState(false);
    const [inlineName, setInlineName] = useState("");
    const [isSavingInline, setIsSavingInline] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [settingsMode, setSettingsMode] = useState<"settings" | "edit">(
        "settings",
    );

    const closeMobileSidebar = () => setChannelSidebarOpen(false);
    const isAdmin = workspace?.role === "admin";

    useEffect(() => {
        if (!isRenamingInline) return;
        inlineNameInputRef.current?.focus();
        inlineNameInputRef.current?.select();
    }, [isRenamingInline]);

    const handleSetupClick = () => {
        if (workspaceId) markWorkspaceSetupSeen(workspaceId);
        setTab("setup");
        closeMobileSidebar();
    };

    const handleChannelClick = (channelId: string) => {
        if (workspaceId) markWorkspaceSetupSeen(workspaceId);
        setTab(channelTabId(channelId));
        closeMobileSidebar();
    };

    const startInlineRename = () => {
        if (!isAdmin || !workspace) return;
        setInlineName(workspace.name);
        setIsRenamingInline(true);
    };

    const saveInlineRename = async () => {
        if (!workspace || !workspaceId || !isAdmin) {
            setIsRenamingInline(false);
            return;
        }

        const trimmed = inlineName.trim();
        if (!trimmed || trimmed === workspace.name) {
            setIsRenamingInline(false);
            return;
        }

        setIsSavingInline(true);
        try {
            await updateWorkspace({ workspaceId, name: trimmed });
        } finally {
            setIsSavingInline(false);
            setIsRenamingInline(false);
        }
    };

    const userName =
        currentUser?.name || currentUser?.email?.split("@")[0] || "Hamza Janzaib";
    const userInitial = userName[0]?.toUpperCase() ?? "H";

    return (
        <aside className="flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground">
            <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-3">
                {isLoading ? (
                    <Skeleton className="h-6 w-28 bg-sidebar-accent" />
                ) : (
                    <button
                        type="button"
                        onDoubleClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startInlineRename();
                        }}
                        className="flex min-w-0 cursor-pointer items-center gap-0.5 rounded-md px-0.5 py-0.5 text-[18px] font-bold leading-tight outline-none hover:bg-sidebar-accent"
                    >
                        {isRenamingInline ? (
                            <Input
                                ref={inlineNameInputRef}
                                value={inlineName}
                                disabled={isSavingInline}
                                className="h-8 min-w-0 text-base font-semibold"
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setInlineName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        void saveInlineRename();
                                    }
                                    if (e.key === "Escape") {
                                        e.preventDefault();
                                        setIsRenamingInline(false);
                                    }
                                }}
                                onBlur={() => void saveInlineRename()}
                            />
                        ) : (
                            <span className="truncate">
                                {workspace?.name ?? "Testing"}
                            </span>
                        )}
                        <ChevronDown className="size-4 shrink-0 opacity-80" />
                    </button>
                )}
                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        aria-label="Settings"
                        onClick={() => {
                            setSettingsMode("settings");
                            setSettingsModalOpen(true);
                        }}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-sidebar-border text-sidebar-foreground/80 outline-none hover:bg-sidebar-accent"
                    >
                        <Settings className="size-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="Edit workspace"
                        onClick={() => {
                            setSettingsMode("edit");
                            setSettingsModalOpen(true);
                        }}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-sidebar-border text-sidebar-foreground/80 outline-none hover:bg-sidebar-accent"
                    >
                        <SquarePen className="size-4" />
                    </button>
                </div>
            </div>

            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-3">
                <div className="px-3 pt-2.5 pb-3">
                    <button
                        type="button"
                        onClick={handleSetupClick}
                        className={cn(
                            "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left outline-none",
                            tab === "setup"
                                ? "bg-sidebar-accent ring-1 ring-sidebar-ring"
                                : "bg-sidebar-accent/70 hover:bg-sidebar-accent",
                        )}
                    >
                        <Compass className="size-[18px] shrink-0 text-sidebar-foreground/90" />
                        <span className="flex-1 text-[15px] font-semibold">
                            Set up your space
                        </span>
                        <span
                            className="size-5 shrink-0 rounded-full border-2 border-sidebar-foreground/20 border-t-primary"
                            aria-hidden
                        />
                    </button>
                </div>

                <div className="space-y-0.5 pb-2">
                    <SidebarNavItem
                        label="Huddles"
                        icon={<Headphones className="size-[18px] shrink-0 opacity-90" />}
                        isActive={tab === "huddles"}
                        onClick={() => {
                            setTab("huddles");
                            closeMobileSidebar();
                        }}
                    />
                    <SidebarNavItem
                        label="Directories"
                        icon={<Contact className="size-[18px] shrink-0 opacity-90" />}
                        isActive={tab === "directories"}
                        onClick={() => {
                            setTab("directories");
                            closeMobileSidebar();
                        }}
                    />
                </div>

                <div className="mt-1 space-y-3">
                    <div>
                        <SectionHeader
                            title="Channels"
                            icon={
                                <span className="flex size-4 items-center justify-center rounded border border-sidebar-border">
                                    <Hash className="size-2.5" />
                                </span>
                            }
                        />
                        <div className="mt-0.5 space-y-px">
                            {channels.map((channel) => (
                                <SidebarNavItem
                                    key={channel.id}
                                    label={`# ${channel.name}`}
                                    isActive={tab === channelTabId(channel.id)}
                                    onClick={() => handleChannelClick(channel.id)}
                                    className="pl-4"
                                />
                            ))}
                            <SidebarNavItem
                                label="Add channels"
                                icon={
                                    <Plus className="size-[18px] shrink-0 opacity-70" />
                                }
                                className="text-sidebar-foreground/70"
                            />
                        </div>
                    </div>

                    <div>
                        <SectionHeader
                            title="Direct messages"
                            icon={
                                <MessageSquare className="size-4 opacity-80" />
                            }
                        />
                        <div className="mt-0.5 space-y-px">
                            {dmUsers.map((user) => (
                                <SidebarNavItem
                                    key={user.id}
                                    label={user.name}
                                    icon={
                                        <DmAvatar
                                            initials={user.initials}
                                            variant="default"
                                        />
                                    }
                                    className="pl-4"
                                />
                            ))}
                            <SidebarNavItem
                                label={userName}
                                suffix="you"
                                icon={
                                    <DmAvatar
                                        initials={userInitial}
                                        variant="self"
                                    />
                                }
                                className="pl-4"
                            />
                            <SidebarNavItem
                                label="Invite people"
                                icon={
                                    <Plus className="size-[18px] shrink-0 opacity-70" />
                                }
                                className="text-sidebar-foreground/70"
                            />
                        </div>
                    </div>

                    <div>
                        <SectionHeader
                            title="Apps"
                            icon={
                                <LayoutGrid className="size-4 opacity-80" />
                            }
                        />
                        <SidebarNavItem
                            label="Slackbot"
                            icon={<BotLogo size="icon" className="rounded-sm" />}
                            badge={1}
                            className="pl-4 font-medium"
                        />
                    </div>
                </div>
            </div>

            {!isLoading && workspace && workspaceId && (
                <WorkspaceSettingsModal
                    open={settingsModalOpen}
                    onOpenChange={setSettingsModalOpen}
                    workspaceId={workspaceId}
                    workspaceName={workspace.name}
                    inviteCode={workspace.inviteCode}
                    isAdmin={isAdmin}
                    mode={settingsMode}
                />
            )}
        </aside>
    );
}
