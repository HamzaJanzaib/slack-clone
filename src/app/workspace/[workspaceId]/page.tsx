"use client";

import { use } from "react";
import { UserAvatar } from "@/features/auth/components/user-avatar";

type WorkspacePageProps = {
    params: Promise<{ workspaceId: string }>;
};

export default function WorkspacePage({ params }: WorkspacePageProps) {
    const { workspaceId } = use(params);

    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
                <h1 className="text-lg font-semibold tracking-tight">
                    Workspace
                </h1>
                <UserAvatar />
            </header>
            <main className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">
                    Workspace ID: {workspaceId}
                </p>
            </main>
        </div>
    );
}
