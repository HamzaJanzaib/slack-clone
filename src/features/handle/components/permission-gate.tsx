"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Camera, Headphones, Mic, Monitor } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { requestMediaPermissions } from "../lib/media-permissions";
import { useHandleStore } from "../store/use-handle-store";
import { toast } from "sonner";

export function PermissionGate({
    workspaceId,
}: {
    workspaceId: Id<"workspaces">;
}) {
    const {
        permissionGateOpen,
        setPermissionGateOpen,
        pendingTarget,
        setPendingTarget,
        setActiveSessionId,
    } = useHandleStore();
    const [isJoining, setIsJoining] = useState(false);
    const createSession = useMutation(api.handles.createSession);

    const handleAllow = async () => {
        if (!pendingTarget) return;

        setIsJoining(true);
        try {
            await requestMediaPermissions({ audio: true, video: false });

            const sessionId = await createSession({
                workspaceId,
                type: pendingTarget.type,
                channelId: pendingTarget.channelId,
                targetUserId: pendingTarget.targetUserId,
            });

            setActiveSessionId(sessionId);
            setPermissionGateOpen(false);
            setPendingTarget(null);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Could not start huddle",
            );
        } finally {
            setIsJoining(false);
        }
    };

    const handleSkip = async () => {
        if (!pendingTarget) return;
        setIsJoining(true);
        try {
            const sessionId = await createSession({
                workspaceId,
                type: pendingTarget.type,
                channelId: pendingTarget.channelId,
                targetUserId: pendingTarget.targetUserId,
            });
            setActiveSessionId(sessionId);
            setPermissionGateOpen(false);
            setPendingTarget(null);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Could not start huddle",
            );
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Dialog
            open={permissionGateOpen}
            onOpenChange={(open) => {
                setPermissionGateOpen(open);
                if (!open) setPendingTarget(null);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Allow microphone and camera</DialogTitle>
                    <DialogDescription>
                        {pendingTarget
                            ? `Join huddle with ${pendingTarget.label}`
                            : "Slack needs access to your devices for huddles."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center gap-6 py-6">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Mic className="size-8" />
                        <span className="text-xs">Microphone</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Camera className="size-8" />
                        <span className="text-xs">Camera</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Monitor className="size-8" />
                        <span className="text-xs">Screen</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Headphones className="size-8" />
                        <span className="text-xs">Audio</span>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button
                        type="button"
                        className="w-full cursor-pointer"
                        disabled={isJoining}
                        onClick={() => void handleAllow()}
                    >
                        Allow access
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full cursor-pointer"
                        disabled={isJoining}
                        onClick={() => void handleSkip()}
                    >
                        Continue without devices
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
