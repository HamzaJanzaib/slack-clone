"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";
import { WorkspaceLogo } from "@/features/workspaces/components/workspace-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMemberInitials } from "@/features/workspaces/lib/workspace-utils";
import { Id } from "../../../../convex/_generated/dataModel";

export type WorkspaceListItem = {
    _id: Id<"workspaces">;
    _creationTime: number;
    name: string;
    image?: string;
    inviteCode: string;
    ownerId: Id<"users">;
    memberCount: number;
    memberPreview: Array<{
        _id: Id<"users">;
        name: string | null;
        image: string | null;
    }>;
    role: "admin" | "member";
};

type WorkspaceCardProps = {
    workspace: WorkspaceListItem;
};

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
    const router = useRouter();

    return (
        <button
            type="button"
            onClick={() => router.push(`/workspace/${workspace._id}`)}
            className="flex w-full cursor-pointer items-center gap-4 rounded-lg border border-transparent px-2 py-3 text-left transition-colors hover:border-border hover:bg-accent/50"
        >
            <WorkspaceLogo
                name={workspace.name}
                image={workspace.image}
                size="lg"
            />

            <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold">{workspace.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                        {workspace.memberPreview.map((member) => (
                            <Avatar
                                key={member._id}
                                className="size-6 border-2 border-background"
                            >
                                {member.image && (
                                    <AvatarImage
                                        src={member.image}
                                        alt={member.name ?? "Member"}
                                    />
                                )}
                                <AvatarFallback className="text-[10px]">
                                    {getMemberInitials(member.name)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <span>
                        {workspace.memberCount}{" "}
                        {workspace.memberCount === 1 ? "member" : "members"}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span>
                        Last active{" "}
                        {formatDistanceToNow(workspace._creationTime, {
                            addSuffix: true,
                        })}
                    </span>
                </div>
            </div>

            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </button>
    );
}
