"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import {
    ChevronDown,
    Compass,
    Hash,
    Headphones,
    List,
    MessageSquare,
    Plus,
    Settings,
    SquarePen,
    Star,
    UserPlus,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import {
    markWorkspaceSetupSeen,
    useWorkspaceUi,
} from "@/features/workspaces/context/workspace-ui-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const placeholderChannels = [
    { id: "all", name: "all-testing" },
    { id: "new", name: "new-channel" },
    { id: "social", name: "social" },
];

function SidebarSection({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="px-3 py-1">
            <div className="mb-1 flex items-center gap-1.5 px-1 text-xs font-semibold text-sidebar-foreground/70">
                {icon}
                <span>{title}</span>
            </div>
            {children}
        </div>
    );
}

function SidebarRow({
    label,
    icon,
    isActive,
    onClick,
    badge,
}: {
    label: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    onClick?: () => void;
    badge?: number;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none",
                isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/90 hover:bg-sidebar-accent",
            )}
        >
            {icon}
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {badge !== undefined && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
                    {badge}
                </span>
            )}
        </button>
    );
}

export function ChannelSidebar() {
    const params = useParams();
    const workspaceId = params?.workspaceId as Id<"workspaces"> | undefined;
    const { data: workspace, isLoading } = useGetWorkspace(workspaceId);
    const currentUser = useQuery(api.users.currentUser);
    const {
        mainView,
        setMainView,
        activeChannelId,
        setActiveChannelId,
        setChannelSidebarOpen,
    } = useWorkspaceUi();

    const closeMobileSidebar = () => setChannelSidebarOpen(false);

    const handleSetupClick = () => {
        if (workspaceId) markWorkspaceSetupSeen(workspaceId);
        setMainView("setup");
        setActiveChannelId(null);
        closeMobileSidebar();
    };

    const handleChannelClick = (channelId: string) => {
        if (workspaceId) markWorkspaceSetupSeen(workspaceId);
        setActiveChannelId(channelId);
        setMainView("default");
        closeMobileSidebar();
    };

    const userName = currentUser?.name || currentUser?.email || "You";

    return (
        <aside className="flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground">
            <div className="flex shrink-0 items-center justify-between gap-1 border-b border-sidebar-border px-3 py-2.5">
                {isLoading ? (
                    <Skeleton className="h-5 w-24 bg-sidebar-accent" />
                ) : (
                    <button
                        type="button"
                        className="flex min-w-0 cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-sm font-bold outline-none hover:bg-sidebar-accent"
                    >
                        <span className="truncate">
                            {workspace?.name ?? "Workspace"}
                        </span>
                        <ChevronDown className="size-4 shrink-0 opacity-70" />
                    </button>
                )}
                <div className="flex shrink-0 items-center">
                    <button
                        type="button"
                        aria-label="Settings"
                        className="flex size-8 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/70 outline-none hover:bg-sidebar-accent"
                    >
                        <Settings className="size-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="New message"
                        className="flex size-8 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/70 outline-none hover:bg-sidebar-accent"
                    >
                        <SquarePen className="size-4" />
                    </button>
                </div>
            </div>

            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2">
                <div className="px-3 pb-2">
                    <button
                        type="button"
                        onClick={handleSetupClick}
                        className={cn(
                            "flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-left outline-none",
                            mainView === "setup"
                                ? "border-sidebar-ring bg-sidebar-accent shadow-sm"
                                : "border-sidebar-border bg-sidebar-accent/60 hover:bg-sidebar-accent",
                        )}
                    >
                        <Compass className="size-4 shrink-0 text-primary" />
                        <span className="flex-1 text-sm font-semibold">
                            Set up your space
                        </span>
                        <span className="size-5 shrink-0 rounded-full border-2 border-primary/30 border-t-primary" />
                    </button>
                </div>

                <SidebarSection title="Huddles" icon={<Headphones className="size-3.5" />}>
                    <SidebarRow label="Huddles" icon={<Headphones className="size-4 opacity-70" />} />
                </SidebarSection>

                <SidebarSection title="Directories" icon={<List className="size-3.5" />}>
                    <SidebarRow label="Directories" icon={<List className="size-4 opacity-70" />} />
                </SidebarSection>

                <SidebarSection title="Starred" icon={<Star className="size-3.5" />}>
                    <p className="px-2 py-1 text-xs text-sidebar-foreground/50">
                        Drag and drop important stuff here
                    </p>
                </SidebarSection>

                <SidebarSection title="Channels" icon={<Hash className="size-3.5" />}>
                    {placeholderChannels.map((channel) => (
                        <SidebarRow
                            key={channel.id}
                            label={channel.name}
                            icon={<Hash className="size-4 opacity-70" />}
                            isActive={
                                mainView === "default" &&
                                activeChannelId === channel.id
                            }
                            onClick={() => handleChannelClick(channel.id)}
                        />
                    ))}
                    <SidebarRow
                        label="Add channels"
                        icon={<Plus className="size-4 opacity-70" />}
                    />
                </SidebarSection>

                <SidebarSection
                    title="Direct messages"
                    icon={<MessageSquare className="size-3.5" />}
                >
                    <SidebarRow
                        label={`${userName} (you)`}
                        icon={
                            <span className="flex size-5 items-center justify-center rounded bg-primary/20 text-[10px] font-semibold">
                                {userName[0]?.toUpperCase()}
                            </span>
                        }
                    />
                    <SidebarRow
                        label="Invite people"
                        icon={<UserPlus className="size-4 opacity-70" />}
                    />
                </SidebarSection>

                <SidebarSection title="Apps">
                    <SidebarRow
                        label="Assistant"
                        icon={
                            <span className="flex size-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
                                AI
                            </span>
                        }
                        badge={1}
                    />
                </SidebarSection>
            </div>
        </aside>
    );
}
