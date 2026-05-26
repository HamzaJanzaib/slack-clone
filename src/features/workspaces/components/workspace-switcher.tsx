"use client";

import { useParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceLogo } from "@/features/workspaces/components/workspace-logo";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useCreateWorkspaceModel } from "@/features/workspaces/store/use-create-workspaces-create-model";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId as Id<"workspaces"> | undefined;
    const { data: currentWorkspace, isLoading: isCurrentLoading } =
        useGetWorkspace(workspaceId);
    const { data: workspaces, isLoading: isListLoading } = useGetWorkspaces();
    const { isOpen, setIsOpen } = useCreateWorkspaceModel();

    const isLoading = isCurrentLoading || isListLoading;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label="Switch workspace"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar"
                    >
                        {isLoading ? (
                            <Skeleton className="size-9 rounded-lg bg-sidebar-accent" />
                        ) : (
                            <WorkspaceLogo
                                name={currentWorkspace?.name ?? "Workspace"}
                                image={currentWorkspace?.image}
                                size="sm"
                                className="size-9 rounded-lg text-sm"
                            />
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={8}
                    className="w-72 p-2"
                >
                    <p className="px-2 pb-3 text-xs font-medium text-muted-foreground">
                        Workspaces
                    </p>
                    <div className="flex flex-col gap-1">
                        {isListLoading &&
                            Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-12 w-full rounded-lg"
                                />
                            ))}
                        {workspaces?.map((workspace, index) => {
                            const isActive = workspace._id === workspaceId;
                            return (
                                <button
                                    key={workspace._id}
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/workspace/${workspace._id}`,
                                        )
                                    }
                                    className={cn(
                                        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-left outline-none hover:bg-accent",
                                        isActive &&
                                            "bg-accent ring-1 ring-border",
                                    )}
                                >
                                    <WorkspaceLogo
                                        name={workspace.name}
                                        image={workspace.image}
                                        size="sm"
                                        className="size-9 shrink-0 rounded-lg text-sm"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {workspace.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {workspace.memberCount}{" "}
                                            {workspace.memberCount === 1
                                                ? "member"
                                                : "members"}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {index < 9
                                            ? `Ctrl ${index + 1}`
                                            : null}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-left outline-none hover:bg-accent"
                    >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
                            <Plus className="size-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">
                            Add a workspace
                        </span>
                    </button>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateWorkspaceModal open={isOpen} onOpenChange={setIsOpen} />
        </>
    );
}
