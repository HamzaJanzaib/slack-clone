"use client";

import { Check } from "lucide-react";
import type { WorkspaceChannel } from "../types";
import { cn } from "@/lib/utils";

export function DirectoriesChannelsTab({
    channels,
}: {
    channels: WorkspaceChannel[];
    isAdmin: boolean;
}) {
    return (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {channels.map((channel) => (
                <div
                    key={channel._id}
                    className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                    <div className="min-w-0">
                        <p className="text-lg font-bold"># {channel.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            {channel.isJoined && (
                                <span className="flex items-center gap-1 text-green-600">
                                    <Check className="size-3.5" />
                                    Joined
                                </span>
                            )}
                            <span>
                                {channel.memberCount}{" "}
                                {channel.memberCount === 1
                                    ? "member"
                                    : "members"}
                            </span>
                        </div>
                        {channel.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {channel.description}
                            </p>
                        )}
                    </div>
                </div>
            ))}
            {channels.length === 0 && (
                <p className="px-5 py-8 text-sm text-muted-foreground">
                    No channels match your search.
                </p>
            )}
        </div>
    );
}
