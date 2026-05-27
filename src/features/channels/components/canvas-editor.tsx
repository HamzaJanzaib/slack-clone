"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { X } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CanvasBlock } from "../types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CanvasEditorProps = {
    canvasId: Id<"channelCanvases">;
    onClose: () => void;
};

export function CanvasEditor({ canvasId, onClose }: CanvasEditorProps) {
    const canvas = useQuery(api.channelCanvas.getCanvas, { canvasId });
    const updateDoc = useMutation(api.channelCanvas.updateCanvasDoc);
    const renameCanvas = useMutation(api.channelCanvas.renameCanvas);
    const postSystem = useMutation(api.channelChat.postSystemMessage);

    const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
    const [revision, setRevision] = useState(1);
    const [title, setTitle] = useState("Untitled");
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState("");
    const [showTemplates, setShowTemplates] = useState(true);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const editNotifiedRef = useRef(false);

    useEffect(() => {
        if (!canvas?.doc) return;
        setBlocks(canvas.doc.blocks);
        setRevision(canvas.doc.revision);
        setTitle(canvas.title);
    }, [canvas?.doc, canvas?.title]);

    const scheduleSave = (nextBlocks: CanvasBlock[], nextRevision: number) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            void updateDoc({
                canvasId,
                blocks: nextBlocks,
                revision: nextRevision,
            }).then(() => {
                if (!editNotifiedRef.current && canvas?.channelId) {
                    editNotifiedRef.current = true;
                    void postSystem({
                        channelId: canvas.channelId,
                        body: `updated canvas "${title}"`,
                    });
                }
            });
        }, 600);
    };

    const updateBlock = (id: string, text: string) => {
        const next = blocks.map((b) => (b.id === id ? { ...b, text } : b));
        const nextRevision = revision + 1;
        setBlocks(next);
        setRevision(nextRevision);
        scheduleSave(next, nextRevision);
    };

    const startRename = () => {
        setRenameValue(title);
        setIsRenaming(true);
    };

    const commitRename = async () => {
        const trimmed = renameValue.trim();
        setIsRenaming(false);
        if (!trimmed || trimmed === title) return;
        await renameCanvas({ canvasId, title: trimmed });
        setTitle(trimmed);
    };

    if (!canvas) {
        return (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
                Loading canvas...
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col bg-background">
            <div className="border-b border-border bg-muted/30 px-6 py-2 text-xs text-muted-foreground">
                <span className="mr-2 rounded bg-violet-600/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400">
                    PRO
                </span>
                Creating canvases on their own is a paid feature, available with
                your free trial.
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 md:px-16">
                <div className="mx-auto max-w-3xl">
                    {isRenaming ? (
                        <Input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => void commitRename()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") void commitRename();
                                if (e.key === "Escape") setIsRenaming(false);
                            }}
                            className="mb-4 h-auto border-0 bg-transparent px-0 text-4xl font-bold shadow-none focus-visible:ring-0"
                        />
                    ) : (
                        <h1
                            className="mb-6 cursor-text text-4xl font-bold"
                            onDoubleClick={startRename}
                        >
                            {title}
                        </h1>
                    )}

                    <div className="space-y-4">
                        {blocks.map((block) => (
                            <BlockEditor
                                key={block.id}
                                block={block}
                                onChange={(text) => updateBlock(block.id, text)}
                            />
                        ))}
                    </div>

                    {showTemplates && (
                        <div className="mt-12 rounded-xl border border-border bg-card p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="font-semibold">Explore templates</p>
                                <button
                                    type="button"
                                    aria-label="Close templates"
                                    className="cursor-pointer rounded p-1 hover:bg-muted"
                                    onClick={() => setShowTemplates(false)}
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {["Channel overview", "Weekly sync", "Shared resources"].map(
                                    (label) => (
                                        <Button
                                            key={label}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="cursor-pointer rounded-full"
                                        >
                                            {label}
                                        </Button>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end border-t border-border px-4 py-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={onClose}
                >
                    Back to channel
                </Button>
            </div>
        </div>
    );
}

function BlockEditor({
    block,
    onChange,
}: {
    block: CanvasBlock;
    onChange: (text: string) => void;
}) {
    if (block.type === "heading") {
        return (
            <Input
                value={block.text}
                onChange={(e) => onChange(e.target.value)}
                className="h-auto border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
            />
        );
    }

    if (block.type === "bullet") {
        return (
            <div className="flex gap-2">
                <span className="mt-2 text-muted-foreground">•</span>
                <Textarea
                    value={block.text}
                    onChange={(e) => onChange(e.target.value)}
                    rows={1}
                    className="min-h-0 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
            </div>
        );
    }

    return (
        <Textarea
            value={block.text}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className={cn(
                "resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
                block.text === "Words go here" && "text-muted-foreground",
            )}
        />
    );
}
