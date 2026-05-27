"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Settings, Share2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSharePanel } from "@/features/workspaces/components/workspace-share-panel";
import { DeleteWorkspaceDialog } from "@/features/workspaces/components/delete-workspace-dialog";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { Id } from "../../../../convex/_generated/dataModel";

type WorkspaceSettingsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: Id<"workspaces">;
    workspaceName: string;
    inviteCode: string;
    isAdmin: boolean;
    mode?: "settings" | "edit";
};

export function WorkspaceSettingsModal({
    open,
    onOpenChange,
    workspaceId,
    workspaceName,
    inviteCode,
    isAdmin,
    mode = "settings",
}: WorkspaceSettingsModalProps) {
    const router = useRouter();
    const updateWorkspace = useUpdateWorkspace();

    const [name, setName] = useState(workspaceName);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        setName(workspaceName);
        setError(null);
    }, [open, workspaceName]);

    const trimmed = name.trim();
    const canSave = isAdmin && trimmed.length > 0 && trimmed !== workspaceName;

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        setError(null);
        try {
            await updateWorkspace({ workspaceId, name: trimmed });
            onOpenChange(false);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to update workspace.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "edit" ? "Edit workspace" : "Workspace settings"}
                        </DialogTitle>
                        <DialogDescription>
                            Manage your workspace name, invite link, and admin settings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-1">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Settings className="size-4 text-muted-foreground" />
                                General
                            </div>
                            <div className="space-y-2">
                                <Input
                                    value={name}
                                    disabled={!isAdmin || isSaving}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Workspace name"
                                />
                                {!isAdmin && (
                                    <p className="text-xs text-muted-foreground">
                                        Only admins can rename this workspace.
                                    </p>
                                )}
                                {error && (
                                    <p className="text-xs text-destructive">{error}</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Share2 className="size-4 text-muted-foreground" />
                                Invite and members
                            </div>
                            <WorkspaceSharePanel inviteCode={inviteCode} />
                        </div>

                        {isAdmin && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                                        <AlertTriangle className="size-4" />
                                        Danger zone
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Delete the workspace permanently. This removes
                                        all members and cannot be undone.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => setDeleteOpen(true)}
                                    >
                                        Delete workspace
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => void handleSave()}
                            disabled={!canSave || isSaving}
                        >
                            {isSaving ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteWorkspaceDialog
                workspaceId={workspaceId}
                workspaceName={workspaceName}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onDeleted={() => router.push("/")}
            />
        </>
    );
}

