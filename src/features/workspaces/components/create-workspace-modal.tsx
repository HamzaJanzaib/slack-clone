"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
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
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspace";
import { WorkspaceLogo } from "@/features/workspaces/components/workspace-logo";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import { Id } from "../../../../convex/_generated/dataModel";

type CreateWorkspaceModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    required?: boolean;
    onCreated?: (workspaceId: Id<"workspaces">) => void;
};

export function CreateWorkspaceModal({
    open,
    onOpenChange,
    required = false,
    onCreated,
}: CreateWorkspaceModalProps) {
    const router = useRouter();
    const createWorkspace = useCreateWorkspace();
    const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedStorageId, setSelectedStorageId] = useState<string | null>(
        null,
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setName("");
        setPreviewImage(null);
        setSelectedStorageId(null);
        setError(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (required && !nextOpen) return;
        onOpenChange(nextOpen);
        if (!nextOpen) resetForm();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const localPreview = URL.createObjectURL(file);
        setPreviewImage(localPreview);

        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) throw new Error("Upload failed");

            const { storageId } = await result.json();
            setSelectedStorageId(storageId);
        } catch {
            setPreviewImage(null);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
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
            const workspaceId = await createWorkspace({
                name: trimmedName,
                ...(selectedStorageId && { storageId: selectedStorageId }),
            });
            resetForm();
            onOpenChange(false);
            onCreated?.(workspaceId);
            router.push(`/workspace/${workspaceId}`);
        } catch {
            setError("Failed to create workspace. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayName = name.trim() || "Workspace";

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
                            Add a name and optional logo for your team.
                        </DialogDescription>
                    </DialogHeader>

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading || isSubmitting}
                    />

                    <div className="flex flex-col items-center gap-4 py-4">
                        <HintTooltip content="Upload a logo — shown on workspace cards and in the sidebar">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isSubmitting}
                            className="group relative cursor-pointer rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <WorkspaceLogo
                                name={displayName}
                                image={previewImage}
                                size="lg"
                                className="size-20 rounded-xl text-xl"
                            />
                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                {isUploading ? (
                                    <Loader2 className="size-5 animate-spin text-white" />
                                ) : (
                                    <Camera className="size-5 text-white" />
                                )}
                            </div>
                        </button>
                        </HintTooltip>
                        <p className="text-xs text-muted-foreground">
                            Click to upload workspace image
                        </p>

                        <div className="grid w-full gap-2">
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
                                disabled={isSubmitting || isUploading}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={
                                isSubmitting || isUploading || !name.trim()
                            }
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
