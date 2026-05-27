"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Headphones, Plus, X } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useHandleStore } from "../store/use-handle-store";
import { cn } from "@/lib/utils";

export function HuddlesView({
    workspaceId,
}: {
    workspaceId: Id<"workspaces">;
    isAdmin: boolean;
}) {
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const { setStartModalOpen, setPendingTarget, setPermissionGateOpen } =
        useHandleStore();

    const startDmHuddle = (userId: Id<"users">, label: string) => {
        setPendingTarget({ type: "dm", targetUserId: userId, label });
        setPermissionGateOpen(true);
    };

    const startChannelHuddle = (
        channelId: Id<"channels">,
        label: string,
    ) => {
        setPendingTarget({ type: "channel", channelId, label });
        setPermissionGateOpen(true);
    };
    const members = useQuery(api.channels.listWorkspaceMembers, { workspaceId });
    const channels = useQuery(api.channels.listChannels, { workspaceId });

    const otherMembers = members?.filter((m) => !m.isSelf) ?? [];

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-6 py-8 text-foreground md:px-10">
            <div className="mb-8 flex items-center justify-between gap-4">
                <h1 className="text-[28px] font-bold tracking-tight">Huddles</h1>
                <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer rounded-lg border-border"
                    onClick={() => setStartModalOpen(true)}
                >
                    <Plus className="mr-1 size-4" />
                    New huddle
                </Button>
            </div>

            {!bannerDismissed && (
                <div className="relative mb-10 overflow-hidden rounded-xl bg-[#0b4c2f] p-6 text-white md:p-8">
                    <button
                        type="button"
                        aria-label="Dismiss"
                        className="absolute top-4 right-4 cursor-pointer rounded p-1 opacity-70 hover:opacity-100"
                        onClick={() => setBannerDismissed(true)}
                    >
                        <X className="size-4" />
                    </button>
                    <div className="max-w-xl">
                        <h2 className="text-xl font-bold">
                            Instantly connect over audio or video
                        </h2>
                        <p className="mt-2 text-sm text-white/80">
                            Talk it through in real time on a huddle, with
                            screen-sharing, expressive reactions and a message
                            thread that is automatically saved for later
                            reference.
                        </p>
                        <Button
                            type="button"
                            className="mt-5 cursor-pointer bg-[#1a1d21] text-white hover:bg-[#2a2d31]"
                            onClick={() => setStartModalOpen(true)}
                        >
                            <Headphones className="mr-2 size-4" />
                            Start a huddle
                        </Button>
                    </div>
                </div>
            )}

            <section className="mb-10">
                <h2 className="mb-4 text-[15px] font-normal text-muted-foreground">
                    Direct messages — Talk privately 1:1 with someone
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {otherMembers.map((member) => (
                        <DmHuddleCard
                            key={member._id}
                            name={
                                member.name ??
                                member.email?.split("@")[0] ??
                                "Member"
                            }
                            onStart={() =>
                                startDmHuddle(
                                    member._id,
                                    member.name ??
                                        member.email?.split("@")[0] ??
                                        "Member",
                                )
                            }
                        />
                    ))}
                    {otherMembers.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Invite teammates to start a direct huddle.
                        </p>
                    )}
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-[15px] font-normal text-muted-foreground">
                    Channels — Meet with a whole team or just let people drop in
                    and out
                </h2>
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    {channels?.map((channel, i) => (
                        <button
                            key={channel._id}
                            type="button"
                            className={cn(
                                "flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-muted/50",
                                i > 0 && "border-t border-border",
                            )}
                            onClick={() =>
                                startChannelHuddle(
                                    channel._id,
                                    `#${channel.name}`,
                                )
                            }
                        >
                            <span className="flex size-7 items-center justify-center rounded bg-muted text-sm font-medium">
                                #
                            </span>
                            <span className="font-medium">{channel.name}</span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}

function DmHuddleCard({
    name,
    onStart,
}: {
    name: string;
    onStart: () => void;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative h-28 bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-900">
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <span className="flex size-14 items-center justify-center rounded-lg bg-teal-600 text-2xl font-bold text-white">
                        {name[0]?.toUpperCase() ?? "?"}
                    </span>
                    <span className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <span className="size-8 rounded-full bg-muted-foreground/30" />
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-4">
                <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">Away</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer shrink-0"
                    onClick={onStart}
                >
                    Start huddle
                </Button>
            </div>
        </div>
    );
}
