"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Send, X } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function HandleThreadPanel({
    sessionId,
    onClose,
}: {
    sessionId: Id<"handleSessions">;
    onClose: () => void;
}) {
    const [body, setBody] = useState("");
    const [alsoDm, setAlsoDm] = useState(false);
    const session = useQuery(api.handles.getSession, { sessionId });
    const sendMessage = useMutation(api.handles.sendMessage);

    const handleSend = async () => {
        const trimmed = body.trim();
        if (!trimmed) return;
        await sendMessage({ sessionId, body: trimmed });
        setBody("");
    };

    return (
        <aside className="flex w-full shrink-0 flex-col border-l border-white/10 bg-[#1a1d21] md:w-[360px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="font-semibold">Thread</h2>
                <button
                    type="button"
                    aria-label="Close"
                    className="cursor-pointer rounded p-1 hover:bg-white/10"
                    onClick={onClose}
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-sm text-white/70">
                <p className="mb-4">
                    Every huddle has a thread. Send messages, files, links and
                    more. They&apos;re saved even after the huddle ends.
                </p>
                <div className="space-y-3">
                    {session?.messages.map((msg) => (
                        <div key={msg._id} className="rounded-lg bg-white/5 p-3">
                            <p className="text-xs font-medium text-white/90">
                                {msg.user?.name ??
                                    msg.user?.email?.split("@")[0] ??
                                    "User"}
                            </p>
                            <p className="mt-1 text-white/80">{msg.body}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-white/10 p-4">
                <Textarea
                    placeholder="Reply..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    className="mb-3 resize-none border-white/20 bg-white/5 text-white placeholder:text-white/40"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void handleSend();
                        }
                    }}
                />
                <div className="mb-3 flex items-center gap-2">
                    <Checkbox
                        id="also-dm"
                        checked={alsoDm}
                        onCheckedChange={(v) => setAlsoDm(v === true)}
                    />
                    <Label
                        htmlFor="also-dm"
                        className="text-xs text-white/60"
                    >
                        Also send as direct message
                    </Label>
                </div>
                <div className="flex justify-end">
                    <Button
                        type="button"
                        size="sm"
                        className="cursor-pointer"
                        disabled={!body.trim()}
                        onClick={() => void handleSend()}
                    >
                        <Send className="size-4" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}
