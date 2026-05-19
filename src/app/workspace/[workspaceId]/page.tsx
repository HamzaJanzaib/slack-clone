"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/features/auth/components/user-avatar";
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
        <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
                {isLoading ? (
                    <Skeleton className="h-6 w-40" />
                ) : (
                    <h1 className="text-lg font-semibold tracking-tight">
                        {workspace?.name ?? "Workspace"}
                    </h1>
                )}
                <UserAvatar />
            </header>
            <main className="flex flex-1 items-center justify-center p-4">
                {isLoading ? (
                    <Skeleton className="h-40 w-full max-w-md" />
                ) : workspace ? (
                    <Card className="w-full max-w-md shadow-shopify-card">
                        <CardHeader>
                            <CardTitle>{workspace.name}</CardTitle>
                            <CardDescription>
                                Invite teammates with the link below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WorkspaceSharePanel
                                inviteCode={workspace.inviteCode}
                            />
                        </CardContent>
                    </Card>
                ) : null}
            </main>
        </div>
    );
}
