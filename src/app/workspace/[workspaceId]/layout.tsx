import { WorkspaceShell } from "@/app/workspace/[workspaceId]/workspace-shell";

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WorkspaceShell>{children}</WorkspaceShell>;
}
