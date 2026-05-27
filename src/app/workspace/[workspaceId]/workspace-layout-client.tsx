"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { WorkspaceUiProvider } from "@/features/workspaces/context/workspace-ui-context";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { WorkspaceShell } from "@/app/workspace/[workspaceId]/workspace-shell";
import { WorkspacePanels } from "@/app/workspace/[workspaceId]/workspace-panels";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEffect } from "react";

export function WorkspaceLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const workspaceId = params?.workspaceId as Id<"workspaces"> | undefined;
    const { data: workspace } = useGetWorkspace(workspaceId);

    useEffect(() => {
        const onWindowError = (event: ErrorEvent) => {
            // #region agent log
            fetch("http://127.0.0.1:7301/ingest/b333104d-e9fd-48aa-90ec-9ab74aad7a08", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Debug-Session-Id": "334b13",
                },
                body: JSON.stringify({
                    sessionId: "334b13",
                    runId: "pre-fix",
                    hypothesisId: "H4",
                    location: "workspace-layout-client.tsx",
                    message: "Window error captured in workspace layout",
                    data: {
                        message: event.message,
                        filename: event.filename,
                    },
                    timestamp: Date.now(),
                }),
            }).catch(() => {});
            // #endregion
        };
        window.addEventListener("error", onWindowError);
        return () => window.removeEventListener("error", onWindowError);
    }, []);

    if (!workspaceId) return null;

    return (
        <Suspense
            fallback={
                <WorkspaceUiProvider
                    workspaceId={workspaceId}
                    memberCount={workspace?.memberCount}
                >
                    <WorkspaceShell>{children}</WorkspaceShell>
                </WorkspaceUiProvider>
            }
        >
            <WorkspaceUiProvider
                workspaceId={workspaceId}
                memberCount={workspace?.memberCount}
            >
                <WorkspaceShell>
                    <WorkspacePanels>{children}</WorkspacePanels>
                </WorkspaceShell>
            </WorkspaceUiProvider>
        </Suspense>
    );
}
