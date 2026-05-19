"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useJoinWorkspaceByInvite } from "@/features/workspaces/api/use-join-workspace-by-invite";
import { UserAvatar } from "@/features/auth/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type JoinPageProps = {
    params: Promise<{ inviteCode: string }>;
};

export default function JoinWorkspacePage({ params }: JoinPageProps) {
    const { inviteCode } = use(params);
    const router = useRouter();
    const joinWorkspace = useJoinWorkspaceByInvite();
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasAutoJoined = useRef(false);

    const workspace = useQuery(api.workspaces.getWorkspaceByInviteCode, {
        inviteCode,
    });

    const isLoading = workspace === undefined;

    const handleJoin = async () => {
        setIsJoining(true);
        setError(null);
        try {
            const workspaceId = await joinWorkspace({ inviteCode });
            router.replace(`/workspace/${workspaceId}`);
        } catch {
            setError("Could not join workspace. Please try again.");
        } finally {
            setIsJoining(false);
        }
    };

    // After sign-in redirect back to this page, join automatically
    useEffect(() => {
        if (isLoading || workspace === null || workspace === undefined) return;
        if (hasAutoJoined.current) return;
        hasAutoJoined.current = true;

        const autoJoin = async () => {
            setIsJoining(true);
            setError(null);
            try {
                const workspaceId = await joinWorkspace({ inviteCode });
                router.replace(`/workspace/${workspaceId}`);
            } catch {
                hasAutoJoined.current = false;
                setError("Could not join workspace. Please try again.");
            } finally {
                setIsJoining(false);
            }
        };

        void autoJoin();
    }, [isLoading, workspace, inviteCode, joinWorkspace, router]);

    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-end border-b border-border px-4 py-3">
                <UserAvatar />
            </header>
            <main className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-shopify-card">
                    <CardHeader>
                        <CardTitle>Join workspace</CardTitle>
                        <CardDescription>
                            You were invited to collaborate on a workspace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-6 w-48" />
                        ) : workspace === null ? (
                            <p className="text-sm text-destructive">
                                This invite link is invalid or has expired.
                            </p>
                        ) : (
                            <p className="text-sm">
                                Join{" "}
                                <span className="font-semibold">
                                    {workspace.name}
                                </span>{" "}
                                as a member.
                            </p>
                        )}
                        {error && (
                            <p className="mt-2 text-sm text-destructive">
                                {error}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => router.push("/")}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="cursor-pointer"
                            disabled={
                                isLoading ||
                                workspace === null ||
                                isJoining
                            }
                            onClick={() => void handleJoin()}
                        >
                            {isJoining ? "Joining..." : "Join workspace"}
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
