import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const useUpdateWorkspace = () => {
    return useMutation(api.workspaces.updateWorkspace);
};
