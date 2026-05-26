"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { Id } from "../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceSharePanel } from "@/features/workspaces/components/workspace-share-panel";
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

    useEffect(() => {
        if (!isLoading && workspace === null) {
            router.replace("/");
        }
    }, [isLoading, workspace, router]);

    return (
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center py-4 sm:py-8">
                {isLoading ? (
                    <Skeleton className="h-48 w-full sm:h-40" />
                ) : workspace ? (
                    <Card className="w-full shadow-shopify-card">
                        <CardHeader className="space-y-1 px-4 sm:px-6">
                            <CardTitle className="text-lg sm:text-xl">
                                {workspace.name}
                            </CardTitle>
                            <CardDescription>
                                Invite teammates with the link below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-6 sm:px-6">
                            <WorkspaceSharePanel
                                inviteCode={workspace.inviteCode}
                            />
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </main>
    );
}
