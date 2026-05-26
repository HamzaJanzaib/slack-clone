"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "../../../../convex/_generated/dataModel";
import { channelTabId } from "@/features/workspaces/lib/workspace-tab";
import { cn } from "@/lib/utils";

const channels = [
    { id: "all", name: "all-testing" },
    { id: "new", name: "new-channel" },
    { id: "social", name: "social" },
] as const;

const dmUsers = [{ id: "hbahi024", name: "hbahi024", initials: "hb" }] as const;

function SlackbotIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden
            className={cn("size-5 shrink-0", className)}
        >
            <path
                fill="#E01E5A"
                d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
            />
            <path
                fill="#36C5F0"
                d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
            />
            <path
                fill="#2EB67D"
                d="M18.956 8.834a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.524 2.521h-2.52V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.523-2.521V2.522A2.528 2.528 0 0 1 17.688 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
            />
            <path
                fill="#ECB22E"
                d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.52A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.52-2.524v-2.52h2.52zM15.165 17.688a2.528 2.528 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.523h6.313A2.528 2.528 0 0 1 24 17.688a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
            />
        </svg>
    );
}

function SectionHeader({
    title,
    icon,
}: {
    title: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-center gap-1.5 px-4 py-1 text-[16px] font-semibold text-sidebar-foreground/70 -rotate-1">
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
    const currentUser = useQuery(api.users.currentUser);
    const { tab, setTab, setChannelSidebarOpen } = useWorkspaceUi();

    const closeMobileSidebar = () => setChannelSidebarOpen(false);

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
                        className="flex min-w-0 cursor-pointer items-center gap-0.5 rounded-md px-0.5 py-0.5 text-[18px] font-bold leading-tight outline-none hover:bg-sidebar-accent"
                    >
                        <span className="truncate">
                            {workspace?.name ?? "Testing"}
                        </span>
                        <ChevronDown className="size-4 shrink-0 opacity-80" />
                    </button>
                )}
                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        aria-label="Settings"
                        className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-sidebar-border text-sidebar-foreground/80 outline-none hover:bg-sidebar-accent"
                    >
                        <Settings className="size-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="Compose"
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
                            icon={<SlackbotIcon />}
                            badge={1}
                            className="pl-4 font-medium"
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
}
