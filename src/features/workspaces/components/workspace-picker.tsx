"use client";

import { CircleHelp, Plus } from "lucide-react";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import { Button } from "@/components/ui/button";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import {
    WorkspaceCard,
    type WorkspaceListItem,
} from "@/features/workspaces/components/workspace-card";
import { useCreateWorkspaceModel } from "@/features/workspaces/store/use-create-workspaces-create-model";

type WorkspacePickerProps = {
    workspaces: WorkspaceListItem[];
};

export function WorkspacePicker({ workspaces }: WorkspacePickerProps) {
    const { setIsOpen } = useCreateWorkspaceModel();

    return (
        <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
                <h2 className="text-xl font-bold tracking-tight">Workspaces</h2>
                <HintTooltip content="Select a workspace to open it, or join one with an invite code below">
                    <button
                        type="button"
                        className="cursor-pointer rounded-sm p-1 text-muted-foreground hover:text-foreground"
                    >
                        <CircleHelp className="size-4" />
                    </button>
                </HintTooltip>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">Ready to launch</p>

            <div className="mt-3 divide-y divide-border">
                {workspaces.map((workspace) => (
                    <WorkspaceCard key={workspace._id} workspace={workspace} />
                ))}
            </div>

            <div className="mt-8 space-y-4 border-t border-border pt-6">
                <JoinWorkspaceForm />
                <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={() => setIsOpen(true)}
                >
                    <Plus className="size-4" />
                    Create new workspace
                </Button>
            </div>
        </div>
    );
}
