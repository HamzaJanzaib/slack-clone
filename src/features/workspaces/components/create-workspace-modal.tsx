"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspace";

type CreateWorkspaceModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    required?: boolean;
};

export function CreateWorkspaceModal({
    open,
    onOpenChange,
    required = false,
}: CreateWorkspaceModalProps) {
    const createWorkspace = useCreateWorkspace();
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpenChange = (nextOpen: boolean) => {
        if (required && !nextOpen) return;
        onOpenChange(nextOpen);
        if (!nextOpen) {
            setName("");
            setError(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Workspace name is required");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await createWorkspace({ name: trimmedName });
            setName("");
            onOpenChange(false);
        } catch {
            setError("Failed to create workspace. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-md shadow-shopify-card"
                showCloseButton={!required}
            >
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create a workspace</DialogTitle>
                        <DialogDescription>
                            Give your team a place to collaborate. You can always
                            change this later.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="workspace-name">Workspace name</Label>
                            <Input
                                id="workspace-name"
                                placeholder="Acme Inc."
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (error) setError(null);
                                }}
                                disabled={isSubmitting}
                                autoFocus
                                className="border-(--shopify-input-border) shadow-shopify-input focus:shadow-shopify-input-focus"
                            />
                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        {!required && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSubmitting}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="cursor-pointer"
                        >
                            {isSubmitting ? "Creating..." : "Create workspace"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
