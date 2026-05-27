"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { FileText, Plus } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { CanvasPickerModal } from "./canvas-picker-modal";
import { CanvasEditor } from "./canvas-editor";
import { format } from "date-fns";

type ChannelCanvasTabProps = {
    channelId: Id<"channels">;
    activeCanvasId?: Id<"channelCanvases"> | null;
    onActiveCanvasChange?: (id: Id<"channelCanvases"> | null) => void;
};

export function ChannelCanvasTab({
    channelId,
    activeCanvasId: controlledCanvasId,
    onActiveCanvasChange,
}: ChannelCanvasTabProps) {
    const canvases = useQuery(api.channelCanvas.listCanvases, { channelId });
    const [pickerOpen, setPickerOpen] = useState(false);
    const [internalCanvasId, setInternalCanvasId] =
        useState<Id<"channelCanvases"> | null>(null);

    const activeCanvasId = controlledCanvasId ?? internalCanvasId;
    const setActiveCanvasId = (id: Id<"channelCanvases"> | null) => {
        onActiveCanvasChange?.(id);
        setInternalCanvasId(id);
    };

    if (activeCanvasId) {
        return (
            <CanvasEditor
                canvasId={activeCanvasId}
                onClose={() => setActiveCanvasId(null)}
            />
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
                <p className="text-sm text-muted-foreground">
                    Canvases in this channel
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1"
                    onClick={() => setPickerOpen(true)}
                >
                    <Plus className="size-4" />
                    Add canvas
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {canvases === undefined ? (
                    <p className="text-muted-foreground">Loading...</p>
                ) : canvases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <FileText className="mb-4 size-12 text-muted-foreground/50" />
                        <p className="text-lg font-semibold">No canvases yet</p>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            Create a blank canvas or start from a template to
                            collaborate with your team.
                        </p>
                        <Button
                            type="button"
                            className="mt-4 cursor-pointer"
                            onClick={() => setPickerOpen(true)}
                        >
                            Create canvas
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {canvases.map((canvas) => (
                            <button
                                key={canvas._id}
                                type="button"
                                onClick={() => setActiveCanvasId(canvas._id)}
                                className="flex cursor-pointer flex-col rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/50"
                            >
                                <FileText className="mb-3 size-8 text-muted-foreground" />
                                <span className="font-semibold">{canvas.title}</span>
                                <span className="mt-1 text-xs text-muted-foreground">
                                    Updated{" "}
                                    {format(canvas.updatedAt, "MMM d, yyyy")}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <CanvasPickerModal
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                channelId={channelId}
                onCanvasSelected={setActiveCanvasId}
            />
        </div>
    );
}
