"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import {
    Calendar,
    Cloud,
    Mail,
    MessageSquarePlus,
    Store,
    UserPlus,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import {
    markWorkspaceSetupSeen,
    useWorkspaceUi,
} from "@/features/workspaces/context/workspace-ui-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const setupTasks = [
    {
        id: "logo",
        title: "Give your space a logo",
        description:
            "Upload a recognisable image for your team so everyone knows where they are.",
        icon: Store,
        iconClass: "text-pink-500",
    },
    {
        id: "meetings",
        title: "Get reminders for upcoming meetings",
        description: "Connect your calendar to stay on top of your schedule.",
        icon: Calendar,
        iconClass: "text-sky-500",
    },
    {
        id: "files",
        title: "Streamline how you share files",
        description: "Connect cloud storage for easy file sharing.",
        icon: Cloud,
        iconClass: "text-amber-500",
    },
    {
        id: "email",
        title: "Bring in your emails",
        description: "Get notifications and updates from your inbox.",
        icon: Mail,
        iconClass: "text-red-400",
    },
];

export function WorkspaceSetupView() {
    const params = useParams();
    const workspaceId = params?.workspaceId as Id<"workspaces"> | undefined;
    const { data: workspace, isLoading } = useGetWorkspace(workspaceId);
    const currentUser = useQuery(api.users.currentUser);
    const { setMainView } = useWorkspaceUi();

    const displayName =
        currentUser?.name?.split(" ")[0] ||
        currentUser?.email?.split("@")[0] ||
        "there";

    const finishSetup = () => {
        if (workspaceId) markWorkspaceSetupSeen(workspaceId);
        setMainView("default");
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <Skeleton className="h-64 w-full max-w-3xl" />
            </div>
        );
    }

    return (
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
                <div className="mb-8">
                    <p className="text-3xl">👋</p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                        Welcome, {displayName}! Let&apos;s get you collaborating!
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your workspace &middot; {workspace?.name}
                    </p>
                </div>

                <div className="mb-10 grid gap-3 sm:grid-cols-3">
                    <button
                        type="button"
                        onClick={finishSetup}
                        className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left outline-none transition-colors hover:bg-accent"
                    >
                        <MessageSquarePlus className="size-5 text-primary" />
                        <span className="font-semibold">Start a channel</span>
                        <span className="text-xs text-muted-foreground">
                            Create a chat room for specific topics or projects.
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={finishSetup}
                        className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left outline-none transition-colors hover:bg-accent"
                    >
                        <UserPlus className="size-5 text-primary" />
                        <span className="font-semibold">Bring in teammates</span>
                        <span className="text-xs text-muted-foreground">
                            Invite people and add them to channels to collaborate.
                        </span>
                    </button>
                    <div className="flex flex-col justify-center gap-2 rounded-xl border border-border bg-card p-4">
                        <span className="text-sm font-semibold">
                            Get started
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Complete the checklist below to set up your space.
                        </span>
                    </div>
                </div>

                <div className="mb-4 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full border-2 border-primary/30 border-t-primary" />
                    <h2 className="text-lg font-bold sm:text-xl">
                        Set up your team workspace
                    </h2>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    {setupTasks.map((task, index) => {
                        const Icon = task.icon;
                        return (
                            <div
                                key={task.id}
                                className={cn(
                                    "flex items-start gap-4 px-4 py-4 sm:px-5",
                                    index > 0 && "border-t border-border",
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted",
                                        task.iconClass,
                                    )}
                                >
                                    <Icon className="size-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold">{task.title}</p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        {task.description}
                                    </p>
                                </div>
                                <span className="mt-1 size-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        type="button"
                        className="cursor-pointer"
                        onClick={finishSetup}
                    >
                        Go to workspace
                    </Button>
                </div>
            </div>
        </div>
    );
}
