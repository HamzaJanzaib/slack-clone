"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleHelp, LogOut, Plus, Trash2 } from "lucide-react";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModel } from "@/features/workspaces/store/use-create-workspaces-create-model";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { useLeaveWorkspace } from "@/features/workspaces/api/use-leave-workspace";
import { DeleteWorkspaceDialog } from "@/features/workspaces/components/delete-workspace-dialog";
import { WorkspaceSharePanel } from "@/features/workspaces/components/workspace-share-panel";
import { type WorkspaceListItem } from "@/features/workspaces/components/workspace-card";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type WorkspaceMenuProps = {
    currentWorkspaceId?: Id<"workspaces">;
};

export function WorkspaceMenu({ currentWorkspaceId }: WorkspaceMenuProps) {
    const router = useRouter();
    const { data: workspaces, isLoading } = useGetWorkspaces();
    const { setIsOpen } = useCreateWorkspaceModel();
    const updateWorkspace = useUpdateWorkspace();
    const leaveWorkspace = useLeaveWorkspace();

    const [editingId, setEditingId] = useState<Id<"workspaces"> | null>(null);
    const [editName, setEditName] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<WorkspaceListItem | null>(
        null,
    );
    const [leavingId, setLeavingId] = useState<Id<"workspaces"> | null>(null);
    const editInputRef = useRef<HTMLInputElement>(null);
    const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const handleSwitch = (workspaceId: Id<"workspaces">) => {
        if (editingId || workspaceId === currentWorkspaceId) return;
        router.push(`/workspace/${workspaceId}`);
    };

    const scheduleSwitch = (workspaceId: Id<"workspaces">) => {
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
        }
        clickTimeoutRef.current = setTimeout(() => {
            handleSwitch(workspaceId);
        }, 200);
    };

    const startEditing = (workspace: WorkspaceListItem) => {
        if (workspace.role !== "admin") return;
        setEditingId(workspace._id);
        setEditName(workspace.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName("");
    };

    const saveEdit = async (workspaceId: Id<"workspaces">) => {
        const trimmed = editName.trim();
        if (!trimmed) {
            cancelEditing();
            return;
        }

        try {
            await updateWorkspace({ workspaceId, name: trimmed });
        } finally {
            cancelEditing();
        }
    };

    const handleLeave = async (workspace: WorkspaceListItem) => {
        const confirmed = window.confirm(
            `Leave "${workspace.name}"? You can rejoin with an invite link.`,
        );
        if (!confirmed) return;

        setLeavingId(workspace._id);
        try {
            await leaveWorkspace({ workspaceId: workspace._id });
            if (workspace._id === currentWorkspaceId) {
                router.push("/");
            }
        } finally {
            setLeavingId(null);
        }
    };

    const handleDeleted = () => {
        if (deleteTarget?._id === currentWorkspaceId) {
            router.push("/");
        }
    };

    return (
        <>
            <DropdownMenuLabel className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Workspaces</span>
                <HintTooltip
                    content="Click to switch · Admins: double-click name to rename"
                    side="left"
                >
                    <button
                        type="button"
                        className="cursor-pointer rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CircleHelp className="size-3.5" />
                    </button>
                </HintTooltip>
            </DropdownMenuLabel>
            <DropdownMenuGroup className="max-h-48 overflow-y-auto">
                {isLoading && (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                        Loading workspaces...
                    </p>
                )}
                {!isLoading && workspaces?.length === 0 && (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                        No workspaces yet
                    </p>
                )}
                {workspaces?.map((workspace) => {
                    const isActive = workspace._id === currentWorkspaceId;
                    const isEditing = editingId === workspace._id;
                    const isAdmin = workspace.role === "admin";
                    const isLeaving = leavingId === workspace._id;

                    return (
                        <div
                            key={workspace._id}
                            className="group relative flex items-center gap-1 rounded-sm px-1 py-0.5 hover:bg-accent"
                        >
                            <HintTooltip
                                content={
                                    isAdmin
                                        ? "Click to open · Double-click to rename"
                                        : "Click to open this workspace"
                                }
                                side="left"
                            >
                            <button
                                type="button"
                                className="flex min-w-0 flex-1 items-center gap-2 rounded-sm px-1 py-1.5 text-left text-sm outline-none"
                                onClick={() => scheduleSwitch(workspace._id)}
                                onDoubleClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isAdmin) return;
                                    if (clickTimeoutRef.current) {
                                        clearTimeout(clickTimeoutRef.current);
                                    }
                                    startEditing(workspace);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "size-4 shrink-0",
                                        isActive ? "opacity-100" : "opacity-0",
                                    )}
                                />
                                {isEditing ? (
                                    <Input
                                        ref={editInputRef}
                                        value={editName}
                                        className="h-7 px-2 text-sm"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) =>
                                            setEditName(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                void saveEdit(workspace._id);
                                            }
                                            if (e.key === "Escape") {
                                                e.preventDefault();
                                                cancelEditing();
                                            }
                                        }}
                                        onBlur={() =>
                                            void saveEdit(workspace._id)
                                        }
                                    />
                                ) : (
                                    <span className="truncate">
                                        {workspace.name}
                                    </span>
                                )}
                            </button>
                            </HintTooltip>

                            {!isEditing && (
                                <div className="flex shrink-0 items-center">
                                    <WorkspaceSharePanel
                                        inviteCode={workspace.inviteCode}
                                        compact
                                    />
                                    {isAdmin ? (
                                        <HintTooltip
                                            content="Delete workspace permanently (all members will be removed)"
                                            side="left"
                                        >
                                            <button
                                                type="button"
                                                className="flex size-7 cursor-pointer items-center justify-center rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteTarget(workspace);
                                                }}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </HintTooltip>
                                    ) : (
                                        <HintTooltip
                                            content="Leave workspace — rejoin anytime with an invite link"
                                            side="left"
                                        >
                                            <button
                                                type="button"
                                                disabled={isLeaving}
                                                className="flex size-7 cursor-pointer items-center justify-center rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground disabled:opacity-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    void handleLeave(workspace);
                                                }}
                                            >
                                                <LogOut className="size-3.5" />
                                            </button>
                                        </HintTooltip>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </DropdownMenuGroup>
            <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <Plus className="size-4" />
                Create workspace
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DeleteWorkspaceDialog
                workspaceId={deleteTarget?._id ?? null}
                workspaceName={deleteTarget?.name ?? ""}
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                onDeleted={handleDeleted}
            />
        </>
    );
}
