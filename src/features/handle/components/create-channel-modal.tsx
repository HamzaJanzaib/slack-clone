"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function CreateChannelModal({
    open,
    onOpenChange,
    workspaceId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: Id<"workspaces">;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createChannel = useMutation(api.channels.createChannel);

    const handleSubmit = async () => {
        const trimmed = name.trim().replace(/^#/, "");
        if (!trimmed) {
            toast.error("Channel name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await createChannel({
                workspaceId,
                name: trimmed,
                description: description.trim() || undefined,
            });
            toast.success("Channel created");
            setName("");
            setDescription("");
            onOpenChange(false);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to create channel",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create a channel</DialogTitle>
                    <DialogDescription>
                        Channels are where your team communicates. They&apos;re
                        best organised around a topic.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="channel-name">Name</Label>
                        <Input
                            id="channel-name"
                            placeholder="e.g. marketing"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="channel-desc">Description</Label>
                        <Textarea
                            id="channel-desc"
                            placeholder="What's this channel about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="cursor-pointer"
                        disabled={isSubmitting || !name.trim()}
                        onClick={() => void handleSubmit()}
                    >
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
