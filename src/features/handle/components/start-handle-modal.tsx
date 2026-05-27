"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { User } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHandleStore } from "../store/use-handle-store";
import { cn } from "@/lib/utils";

export function StartHandleModal({
    workspaceId,
}: {
    workspaceId: Id<"workspaces">;
}) {
    const {
        startModalOpen,
        setStartModalOpen,
        setPermissionGateOpen,
        setPendingTarget,
    } = useHandleStore();
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<{
        type: "dm" | "channel";
        id: string;
        label: string;
    } | null>(null);

    const members = useQuery(api.channels.listWorkspaceMembers, { workspaceId });
    const channels = useQuery(api.channels.listChannels, { workspaceId });

    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase();
        const people =
            members
                ?.filter((m) => !m.isSelf)
                .filter(
                    (m) =>
                        !q ||
                        m.name?.toLowerCase().includes(q) ||
                        m.email?.toLowerCase().includes(q),
                )
                .map((m) => ({
                    type: "dm" as const,
                    id: m._id,
                    label: m.name ?? m.email?.split("@")[0] ?? "Member",
                })) ?? [];

        const channelList =
            channels
                ?.filter((c) => !q || c.name.toLowerCase().includes(q))
                .map((c) => ({
                    type: "channel" as const,
                    id: c._id,
                    label: `#${c.name}`,
                })) ?? [];

        return [...people, ...channelList].slice(0, 8);
    }, [channels, members, query]);

    const handleStart = () => {
        if (!selected) return;

        setPendingTarget({
            type: selected.type,
            ...(selected.type === "dm"
                ? { targetUserId: selected.id as Id<"users"> }
                : { channelId: selected.id as Id<"channels"> }),
            label: selected.label,
        });
        setStartModalOpen(false);
        setPermissionGateOpen(true);
        setQuery("");
        setSelected(null);
    };

    return (
        <Dialog
            open={startModalOpen}
            onOpenChange={(open) => {
                setStartModalOpen(open);
                if (!open) {
                    setQuery("");
                    setSelected(null);
                }
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Start a huddle</DialogTitle>
                    <DialogDescription>
                        Find a person or channel to huddle with
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <Input
                        placeholder="Search by name"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelected(null);
                        }}
                        autoFocus
                        className="border-primary ring-1 ring-primary/30"
                    />

                    {suggestions.length > 0 && (
                        <div className="overflow-hidden rounded-lg border border-border">
                            {suggestions.map((item) => (
                                <button
                                    key={`${item.type}-${item.id}`}
                                    type="button"
                                    className={cn(
                                        "flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/60",
                                        selected?.id === item.id &&
                                            selected.type === item.type &&
                                            "bg-primary text-primary-foreground hover:bg-primary",
                                    )}
                                    onClick={() => setSelected(item)}
                                >
                                    {item.type === "dm" ? (
                                        <span className="flex size-8 items-center justify-center rounded bg-muted">
                                            <User className="size-4" />
                                        </span>
                                    ) : (
                                        <span className="flex size-8 items-center justify-center rounded bg-muted text-sm font-medium">
                                            #
                                        </span>
                                    )}
                                    <span className="font-medium">
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                        Huddles with more than two people are a paid feature,
                        available with your free trial.
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => setStartModalOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="cursor-pointer"
                        disabled={!selected}
                        onClick={handleStart}
                    >
                        Start a huddle
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
