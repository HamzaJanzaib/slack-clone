"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceUi } from "@/features/workspaces/context/workspace-ui-context";
import { WorkspaceMainView } from "@/features/handle/components/workspace-main-view";
import { ChannelScreen } from "@/features/channels/components/channel-screen";
import { Id } from "../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

type WorkspacePageProps = {
    params: Promise<{ workspaceId: string }>;
};

export default function WorkspacePage({ params }: WorkspacePageProps) {
    const { workspaceId: workspaceIdParam } = use(params);
    const workspaceId = workspaceIdParam as Id<"workspaces">;
    const router = useRouter();
    const { data: workspace, isLoading } = useGetWorkspace(workspaceId);
    const { activeChannelId, tab } = useWorkspaceUi();

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

    if (tab === "huddles" || tab === "directories") {
        return (
            <WorkspaceMainView
                workspaceId={workspaceId}
                isAdmin={workspace.role === "admin"}
            />
        );
    }

    if (activeChannelId) {
        return (
            <ChannelScreen
                workspaceId={workspaceId}
                channelId={activeChannelId as Id<"channels">}
            />
        );
    }

    return (
        <WorkspaceMainView
            workspaceId={workspaceId}
            isAdmin={workspace.role === "admin"}
        />
    );
}
