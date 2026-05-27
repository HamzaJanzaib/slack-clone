"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { HandleRoom } from "@/features/handle/components/handle-room";
import { PermissionGate } from "@/features/handle/components/permission-gate";
import { useHandleStore } from "@/features/handle/store/use-handle-store";
import type { ChannelTab } from "../types";
import { ChannelHeader } from "./channel-header";
import { ChannelMessagesTab } from "./channel-messages-tab";
import { ChannelCanvasTab } from "./channel-canvas-tab";
import { CanvasPickerModal } from "./canvas-picker-modal";

type ChannelScreenProps = {
    workspaceId: Id<"workspaces">;
    channelId: Id<"channels">;
};

export function ChannelScreen({ workspaceId, channelId }: ChannelScreenProps) {
    const channel = useQuery(api.channels.getChannel, { channelId });
    const [activeTab, setActiveTab] = useState<ChannelTab>("messages");
    const [pickerOpen, setPickerOpen] = useState(false);
    const [openCanvasId, setOpenCanvasId] =
        useState<Id<"channelCanvases"> | null>(null);
    const { activeSessionId } = useHandleStore();

    const activeCanvas = useQuery(
        api.channelCanvas.getCanvas,
        openCanvasId ? { canvasId: openCanvasId } : "skip",
    );

    if (channel === undefined) {
        return (
            <div className="flex flex-1 flex-col p-6">
                <Skeleton className="mb-4 h-10 w-64" />
                <Skeleton className="flex-1 rounded-xl" />
            </div>
        );
    }

    if (!channel) {
        return (
            <div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
                Channel not found
            </div>
        );
    }

    if (activeSessionId) {
        return (
            <>
                <HandleRoom sessionId={activeSessionId} workspaceId={workspaceId} />
                <PermissionGate workspaceId={workspaceId} />
            </>
        );
    }

    const handleAddCanvas = () => {
        setActiveTab("canvas");
        setPickerOpen(true);
    };

    const handleCanvasSelected = (canvasId: Id<"channelCanvases">) => {
        setOpenCanvasId(canvasId);
        setActiveTab("canvas");
        setPickerOpen(false);
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-background">
            <ChannelHeader
                workspaceId={workspaceId}
                channelId={channelId}
                channelName={channel.name}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                activeCanvasTitle={
                    activeTab === "canvas"
                        ? (activeCanvas?.title ?? "Canvas")
                        : null
                }
                onAddCanvas={handleAddCanvas}
            />

            {activeTab === "messages" ? (
                <ChannelMessagesTab
                    channelId={channelId}
                    channelName={channel.name}
                    channelDescription={channel.description}
                />
            ) : (
                <ChannelCanvasTab
                    channelId={channelId}
                    activeCanvasId={openCanvasId}
                    onActiveCanvasChange={setOpenCanvasId}
                />
            )}

            <CanvasPickerModal
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                channelId={channelId}
                onCanvasSelected={handleCanvasSelected}
            />

            <PermissionGate workspaceId={workspaceId} />
        </div>
    );
}
