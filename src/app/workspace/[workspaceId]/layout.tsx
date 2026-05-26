import { WorkspaceLayoutClient } from "@/app/workspace/[workspaceId]/workspace-layout-client";

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WorkspaceLayoutClient>{children}</WorkspaceLayoutClient>;
}
