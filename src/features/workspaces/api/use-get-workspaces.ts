import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const useGetWorkspaces = () => {
    const data = useQuery(api.workspaces.getWorkspaces);

    const isLoading = data === undefined;

    const error = data === undefined ? undefined : "Error fetching workspaces";

    return { data, isLoading, error };
};