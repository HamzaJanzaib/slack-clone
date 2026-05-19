import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const useJoinWorkspaceByInvite = () => {
    return useMutation(api.workspaces.joinWorkspaceByInviteCode);
};
