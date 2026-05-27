"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
    AtSign,
    Bold,
    Italic,
    Link2,
    List,
    ListOrdered,
    Mic,
    Paperclip,
    Plus,
    Send,
    Smile,
    Strikethrough,
    Type,
    Zap,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChannelMessagesTabProps = {
    channelId: Id<"channels">;
    channelName: string;
    channelDescription?: string | null;
};

export function ChannelMessagesTab({
    channelId,
    channelName,
    channelDescription,
}: ChannelMessagesTabProps) {
    const messages = useQuery(api.channelChat.listMessages, { channelId });
    const sendMessage = useMutation(api.channelChat.sendMessage);
    const [body, setBody] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        const trimmed = body.trim();
        if (!trimmed) return;
        await sendMessage({ channelId, body: trimmed });
        setBody("");
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold">
                            Everyone&apos;s all here in #{channelName}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {channelDescription ??
                                "Share announcements and updates with your team."}
                        </p>
                    </div>

                    <div className="mb-8 grid gap-4 sm:grid-cols-3">
                        <WelcomeCard
                            title="Add company handbook"
                            subtitle="Canvas template"
                            className="bg-teal-900/40"
                        />
                        <WelcomeCard
                            title="Personalise a welcome message"
                            subtitle="Make it yours"
                            className="bg-amber-900/30"
                        />
                        <WelcomeCard
                            title="Invite teammates"
                            subtitle="Add your whole team"
                            className="bg-violet-900/30"
                        />
                    </div>

                    <div className="space-y-4">
                        {messages?.map((message, index) => {
                            const prev = messages[index - 1];
                            const showDate =
                                !prev ||
                                format(prev.createdAt, "yyyy-MM-dd") !==
                                    format(message.createdAt, "yyyy-MM-dd");

                            return (
                                <div key={message._id}>
                                    {showDate && (
                                        <div className="my-6 flex justify-center">
                                            <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                                                {format(
                                                    message.createdAt,
                                                    "EEEE, d MMMM",
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {message.type === "system" ? (
                                        <p className="text-center text-sm text-muted-foreground">
                                            {message.body}
                                        </p>
                                    ) : (
                                        <MessageRow message={message} />
                                    )}
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>
                </div>
            </div>

            <div className="shrink-0 border-t border-border px-4 py-3">
                <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
                        <ComposerIcon icon={<Bold className="size-3.5" />} />
                        <ComposerIcon icon={<Italic className="size-3.5" />} />
                        <ComposerIcon icon={<Strikethrough className="size-3.5" />} />
                        <ComposerIcon icon={<Link2 className="size-3.5" />} />
                        <ComposerIcon icon={<List className="size-3.5" />} />
                        <ComposerIcon icon={<ListOrdered className="size-3.5" />} />
                    </div>
                    <Textarea
                        placeholder={`Message #${channelName}`}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={2}
                        className="min-h-[72px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void handleSend();
                            }
                        }}
                    />
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center gap-0.5">
                            <ComposerIcon icon={<Plus className="size-4" />} />
                            <ComposerIcon icon={<Type className="size-4" />} />
                            <ComposerIcon icon={<Smile className="size-4" />} />
                            <ComposerIcon icon={<AtSign className="size-4" />} />
                            <ComposerIcon icon={<Paperclip className="size-4" />} />
                            <ComposerIcon icon={<Mic className="size-4" />} />
                            <ComposerIcon icon={<Zap className="size-4" />} />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            className="cursor-pointer gap-1"
                            disabled={!body.trim()}
                            onClick={() => void handleSend()}
                        >
                            <Send className="size-3.5" />
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WelcomeCard({
    title,
    subtitle,
    className,
}: {
    title: string;
    subtitle: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "rounded-xl border border-border/50 p-4",
                className,
            )}
        >
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
    );
}

function MessageRow({
    message,
}: {
    message: {
        body: string;
        createdAt: number;
        user: {
            name: string | null;
            email: string | null;
        } | null;
    };
}) {
    const name =
        message.user?.name ?? message.user?.email?.split("@")[0] ?? "User";
    const initial = name[0]?.toUpperCase() ?? "?";

    return (
        <div className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
                {initial}
            </span>
            <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                    <span className="font-bold">{name}</span>
                    <span className="text-xs text-muted-foreground">
                        {format(message.createdAt, "HH:mm")}
                    </span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap">{message.body}</p>
            </div>
        </div>
    );
}

function ComposerIcon({ icon }: { icon: React.ReactNode }) {
    return (
        <button
            type="button"
            className="flex size-7 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
            {icon}
        </button>
    );
}
