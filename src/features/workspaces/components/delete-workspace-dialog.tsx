"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteWorkspace } from "@/features/workspaces/api/use-delete-workspace";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";

type DeleteWorkspaceDialogProps = {
    workspaceId: Id<"workspaces"> | null;
    workspaceName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleted: () => void;
};

export function DeleteWorkspaceDialog({
    workspaceId,
    workspaceName,
    open,
    onOpenChange,
    onDeleted,
}: DeleteWorkspaceDialogProps) {
    const deleteWorkspace = useDeleteWorkspace();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!workspaceId) return;

        setIsDeleting(true);
        try {
            await deleteWorkspace({ workspaceId });
            onOpenChange(false);
            onDeleted();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete workspace</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{workspaceName}&quot;?
                        This will remove all members and cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={(e) => {
                            e.preventDefault();
                            void handleDelete();
                        }}
                    >
                        {isDeleting ? "Deleting..." : "Delete workspace"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
