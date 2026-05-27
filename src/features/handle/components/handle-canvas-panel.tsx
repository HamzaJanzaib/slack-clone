"use client";

import { Calendar, Headphones, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HandleCanvasPanel({ onClose }: { onClose: () => void }) {
    return (
        <aside className="flex w-full shrink-0 flex-col border-l border-white/10 bg-[#1a1d21] md:w-[400px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="font-semibold">Canvas</h2>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer border-white/20 text-white hover:bg-white/10"
                    >
                        Share
                    </Button>
                    <button
                        type="button"
                        aria-label="Close"
                        className="cursor-pointer rounded p-1 hover:bg-white/10"
                        onClick={onClose}
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-sm text-white/80">
                <div className="mb-4 rounded-lg bg-white/5 p-3 text-xs text-white/60">
                    Canvas is a paid feature on Slack. This is a collaborative
                    notes area for your huddle.
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/70">
                        <Calendar className="size-4" />
                        <span>Today&apos;s date</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                        <Headphones className="size-4" />
                        <span>Meeting location</span>
                    </div>

                    <div>
                        <p className="mb-2 font-semibold text-white">Agenda</p>
                        <ul className="list-inside list-disc space-y-1 text-white/70">
                            <li>Topic 1</li>
                            <li>Topic 2</li>
                            <li>Topic 3</li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-2 font-semibold text-white">
                            Meeting notes
                        </p>
                        <ul className="list-inside list-disc space-y-1 text-white/70">
                            <li>What we discussed</li>
                            <li>Decisions that we made</li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-2 font-semibold text-white">
                            Next steps
                        </p>
                        <label className="flex items-center gap-2 text-white/70">
                            <input type="checkbox" className="rounded" />
                            To-do
                        </label>
                    </div>
                </div>
            </div>
        </aside>
    );
}
