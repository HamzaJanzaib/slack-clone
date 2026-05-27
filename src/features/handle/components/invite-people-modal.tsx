"use client";

import { useState } from "react";
import { useAction } from "convex/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceSharePanel } from "@/features/workspaces/components/workspace-share-panel";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { toast } from "sonner";

export function InvitePeopleModal({
    open,
    onOpenChange,
    workspaceId,
    channelId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: Id<"workspaces">;
    channelId?: Id<"channels">;
}) {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inviteByEmail = useAction(api.invites.inviteByEmail);
    const { data: workspace } = useGetWorkspace(workspaceId);

    const handleSend = async () => {
        const trimmed = email.trim();
        if (!trimmed.includes("@")) {
            toast.error("Enter a valid email");
            return;
        }

        setIsSubmitting(true);
        try {
            await inviteByEmail({ workspaceId, email: trimmed, channelId });
            toast.success(`Invitation sent to ${trimmed}`);
            setEmail("");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to send invite",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Invite people</DialogTitle>
                    <DialogDescription>
                        Send an email invitation or share your workspace link.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="invite-email">Email address</Label>
                        <div className="flex gap-2">
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button
                                type="button"
                                className="cursor-pointer shrink-0"
                                disabled={isSubmitting || !email.trim()}
                                onClick={() => void handleSend()}
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                    {workspace?.inviteCode && (
                        <WorkspaceSharePanel inviteCode={workspace.inviteCode} />
                    )}
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => onOpenChange(false)}
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
