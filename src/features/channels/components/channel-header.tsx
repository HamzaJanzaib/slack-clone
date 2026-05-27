"use client";

import { useState } from "react";
import {
    Bell,
    ChevronDown,
    Headphones,
    MoreVertical,
    Search,
    Star,
    UserPlus,
} from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { InvitePeopleModal } from "@/features/handle/components/invite-people-modal";
import { useHandleStore } from "@/features/handle/store/use-handle-store";
import { cn } from "@/lib/utils";
import type { ChannelTab } from "../types";

type ChannelHeaderProps = {
    workspaceId: Id<"workspaces">;
    channelId: Id<"channels">;
    channelName: string;
    activeTab: ChannelTab;
    onTabChange: (tab: ChannelTab) => void;
    activeCanvasTitle?: string | null;
    onAddCanvas: () => void;
};

export function ChannelHeader({
    workspaceId,
    channelId,
    channelName,
    activeTab,
    onTabChange,
    activeCanvasTitle,
    onAddCanvas,
}: ChannelHeaderProps) {
    const [inviteOpen, setInviteOpen] = useState(false);
    const { setPendingTarget, setPermissionGateOpen } = useHandleStore();

    const startHuddle = () => {
        setPendingTarget({
            type: "channel",
            channelId,
            label: `#${channelName}`,
        });
        setPermissionGateOpen(true);
    };

    return (
        <>
            <header className="shrink-0 border-b border-border bg-background">
                <div className="flex items-center justify-between gap-4 px-4 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <button
                            type="button"
                            aria-label="Star channel"
                            className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <Star className="size-4" />
                        </button>
                        <h1 className="truncate text-lg font-bold">
                            {channelName}
                        </h1>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="hidden cursor-pointer gap-1 sm:flex"
                            onClick={() => setInviteOpen(true)}
                        >
                            <UserPlus className="size-4" />
                            Invite teammates
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="cursor-pointer gap-1"
                            onClick={startHuddle}
                        >
                            <Headphones className="size-4" />
                            Huddle
                            <ChevronDown className="size-3 opacity-60" />
                        </Button>
                        <IconButton icon={<Bell className="size-4" />} label="Notifications" />
                        <IconButton icon={<Search className="size-4" />} label="Search" />
                        <IconButton icon={<MoreVertical className="size-4" />} label="More" />
                    </div>
                </div>

                <div className="flex items-center gap-1 px-4">
                    <TabButton
                        active={activeTab === "messages"}
                        onClick={() => onTabChange("messages")}
                    >
                        Messages
                    </TabButton>
                    <TabButton
                        active={activeTab === "canvas"}
                        onClick={() => onTabChange("canvas")}
                    >
                        {activeCanvasTitle ?? "Add canvas"}
                    </TabButton>
                    <button
                        type="button"
                        aria-label="Add canvas"
                        className="mb-1 flex size-8 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted"
                        onClick={onAddCanvas}
                    >
                        <span className="text-lg leading-none">+</span>
                    </button>
                </div>
            </header>

            <InvitePeopleModal
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                workspaceId={workspaceId}
                channelId={channelId}
            />
        </>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
            )}
        >
            {children}
        </button>
    );
}

function IconButton({
    icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            className="flex size-8 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
            {icon}
        </button>
    );
}
