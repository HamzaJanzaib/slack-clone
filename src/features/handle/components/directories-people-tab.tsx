"use client";

import { Check, Pencil, User } from "lucide-react";
import type { WorkspaceMember } from "../types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DirectoriesPeopleTab({
    members,
}: {
    members: WorkspaceMember[];
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member) => (
                <MemberCard key={member._id} member={member} />
            ))}
            {members.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No people match your search.
                </p>
            )}
        </div>
    );
}

function MemberCard({ member }: { member: WorkspaceMember }) {
    const displayName =
        member.name ?? member.email?.split("@")[0] ?? "Member";
    const initial = displayName[0]?.toUpperCase() ?? "?";

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div
                className={cn(
                    "relative flex h-32 items-center justify-center",
                    member.isSelf ? "bg-teal-600" : "bg-muted",
                )}
            >
                {member.isSelf ? (
                    <span className="text-5xl font-bold text-white">{initial}</span>
                ) : (
                    <User className="size-16 text-muted-foreground/50" />
                )}
                {member.isSelf && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-3 right-3 cursor-pointer gap-1"
                    >
                        <Pencil className="size-3" />
                        Edit
                    </Button>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-center gap-1.5">
                    <p className="font-semibold">{displayName}</p>
                    {member.isSelf && (
                        <Check className="size-4 text-green-600" />
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    {member.isSelf
                        ? "That's you!"
                        : member.role === "admin"
                          ? "Workspace admin"
                          : "Invited member"}
                </p>
            </div>
        </div>
    );
}
