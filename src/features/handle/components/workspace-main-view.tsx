"use client";

import { useWorkspaceUi } from "@/features/workspaces/context/workspace-ui-context";
import { useHandleStore } from "../store/use-handle-store";
import { HuddlesView } from "./huddles-view";
import { DirectoriesView } from "./directories-view";
import { HandleRoom } from "./handle-room";
import { StartHandleModal } from "./start-handle-modal";
import { PermissionGate } from "./permission-gate";

export function WorkspaceMainView({
    workspaceId,
    isAdmin,
}: {
    workspaceId: import("../../../../convex/_generated/dataModel").Id<"workspaces">;
    isAdmin: boolean;
}) {
    const { tab } = useWorkspaceUi();
    const { activeSessionId } = useHandleStore();

    if (activeSessionId) {
        return (
            <>
                <HandleRoom
                    sessionId={activeSessionId}
                    workspaceId={workspaceId}
                />
                <StartHandleModal workspaceId={workspaceId} />
                <PermissionGate workspaceId={workspaceId} />
            </>
        );
    }

    return (
        <>
            {tab === "huddles" && (
                <HuddlesView workspaceId={workspaceId} isAdmin={isAdmin} />
            )}
            {tab === "directories" && (
                <DirectoriesView workspaceId={workspaceId} isAdmin={isAdmin} />
            )}
            <StartHandleModal workspaceId={workspaceId} />
            <PermissionGate workspaceId={workspaceId} />
        </>
    );
}
