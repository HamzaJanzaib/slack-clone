"use client";

import { useMutation, useQuery } from "convex/react";
import { FilePlus, Files, LayoutTemplate } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CanvasPickerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    channelId: Id<"channels">;
    onCanvasSelected: (canvasId: Id<"channelCanvases">) => void;
};

export function CanvasPickerModal({
    open,
    onOpenChange,
    channelId,
    onCanvasSelected,
}: CanvasPickerModalProps) {
    const canvases = useQuery(api.channelCanvas.listCanvases, { channelId });
    const createCanvas = useMutation(api.channelCanvas.createCanvas);
    const duplicateCanvas = useMutation(api.channelCanvas.duplicateCanvas);

    const handleNewBlank = async () => {
        try {
            const id = await createCanvas({ channelId });
            onCanvasSelected(id);
            onOpenChange(false);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to create canvas",
            );
        }
    };

    const handleTemplate = async (templateKey: string, title: string) => {
        try {
            const id = await createCanvas({ channelId, title, templateKey });
            onCanvasSelected(id);
            onOpenChange(false);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to create canvas",
            );
        }
    };

    const handleDuplicate = async (sourceCanvasId: Id<"channelCanvases">) => {
        try {
            const id = await duplicateCanvas({ sourceCanvasId, channelId });
            onCanvasSelected(id);
            onOpenChange(false);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to add canvas",
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm gap-0 overflow-hidden p-0 sm:max-w-sm">
                <DialogHeader className="border-b border-border px-4 py-3">
                    <DialogTitle className="text-base">Add canvas</DialogTitle>
                </DialogHeader>
                <div className="p-1">
                    <PickerRow
                        icon={<FilePlus className="size-4" />}
                        label="New blank canvas"
                        onClick={() => void handleNewBlank()}
                    />
                    {canvases && canvases.length > 0 && (
                        <div className="border-t border-border py-1">
                            <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                Add existing canvas
                            </p>
                            {canvases.map((canvas) => (
                                <PickerRow
                                    key={canvas._id}
                                    icon={<Files className="size-4" />}
                                    label={canvas.title}
                                    onClick={() => void handleDuplicate(canvas._id)}
                                />
                            ))}
                        </div>
                    )}
                    <div className="border-t border-border py-1">
                        <PickerRow
                            icon={<LayoutTemplate className="size-4" />}
                            label="Start with a template"
                            onClick={() =>
                                void handleTemplate("overview", "Channel overview")
                            }
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PickerRow({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm",
                "hover:bg-muted/80",
            )}
        >
            <span className="text-muted-foreground">{icon}</span>
            <span>{label}</span>
        </button>
    );
}
