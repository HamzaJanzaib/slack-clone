"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hash } from "lucide-react";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceUi } from "@/features/workspaces/context/workspace-ui-context";
import { WorkspaceSharePanel } from "@/features/workspaces/components/workspace-share-panel";
import { Id } from "../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type WorkspacePageProps = {
    params: Promise<{ workspaceId: string }>;
};

export default function WorkspacePage({ params }: WorkspacePageProps) {
    const { workspaceId: workspaceIdParam } = use(params);
    const workspaceId = workspaceIdParam as Id<"workspaces">;
    const router = useRouter();
    const { data: workspace, isLoading } = useGetWorkspace(workspaceId);
    const { activeChannelId } = useWorkspaceUi();

    useEffect(() => {
        if (!isLoading && workspace === null) {
            router.replace("/");
        }
    }, [isLoading, workspace, router]);

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <Skeleton className="h-56 w-full max-w-md rounded-2xl" />
            </div>
        );
    }

    if (!workspace) return null;

    if (activeChannelId) {
        return (
            <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-3xl">
                    <div className="mb-4 flex items-center gap-2 text-muted-foreground">
                        <Hash className="size-5" />
                        <span className="text-sm font-medium">
                            {activeChannelId === "all"
                                ? "all-testing"
                                : activeChannelId === "new"
                                  ? "new-channel"
                                  : activeChannelId === "social"
                                    ? "social"
                                    : activeChannelId}
                        </span>
                    </div>
                    <Card className="rounded-2xl shadow-shopify-card">
                        <CardHeader className="px-6 pt-8 pb-2">
                            <CardTitle className="text-xl font-bold">
                                Channel coming soon
                            </CardTitle>
                            <CardDescription>
                                Messaging for this channel is under construction.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-8">
                            <p className="text-sm text-muted-foreground">
                                Select another channel or finish setting up your
                                workspace from the sidebar.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
            <Card className="w-full max-w-md rounded-2xl border border-border/60 shadow-shopify-card">
                <CardHeader className="gap-2 px-6 pt-8 pb-0 sm:px-8">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {workspace.name}
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        Invite teammates with the link below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pt-6 pb-8 sm:px-8 sm:pb-10">
                    <WorkspaceSharePanel inviteCode={workspace.inviteCode} />
                </CardContent>
            </Card>
        </div>
    );
}
