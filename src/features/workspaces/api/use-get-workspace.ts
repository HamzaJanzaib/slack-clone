import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useGetWorkspace = (workspaceId: Id<"workspaces"> | undefined) => {
    const data = useQuery(
        api.workspaces.getWorkspace,
        workspaceId ? { workspaceId } : "skip",
    );

    return {
        data,
        isLoading: workspaceId !== undefined && data === undefined,
    };
};
