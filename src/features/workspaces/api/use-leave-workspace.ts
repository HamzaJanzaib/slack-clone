import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const useLeaveWorkspace = () => {
    return useMutation(api.workspaces.leaveWorkspace);
};
