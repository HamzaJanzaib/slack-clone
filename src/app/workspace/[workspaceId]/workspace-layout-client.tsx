"use client";

import { useParams } from "next/navigation";
import { WorkspaceUiProvider } from "@/features/workspaces/context/workspace-ui-context";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { WorkspaceShell } from "@/app/workspace/[workspaceId]/workspace-shell";
import { WorkspacePanels } from "@/app/workspace/[workspaceId]/workspace-panels";
import { Id } from "../../../../convex/_generated/dataModel";

export function WorkspaceLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const workspaceId = params?.workspaceId as Id<"workspaces"> | undefined;
    const { data: workspace } = useGetWorkspace(workspaceId);

    if (!workspaceId) {
        return <WorkspaceShell>{children}</WorkspaceShell>;
    }

    return (
        <WorkspaceUiProvider
            workspaceId={workspaceId}
            memberCount={workspace?.memberCount}
        >
            <WorkspaceShell>
                <WorkspacePanels>{children}</WorkspacePanels>
            </WorkspaceShell>
        </WorkspaceUiProvider>
    );
}
