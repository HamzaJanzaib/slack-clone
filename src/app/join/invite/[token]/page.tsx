"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
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

type InviteJoinPageProps = {
    params: Promise<{ token: string }>;
};

export default function InviteJoinPage({ params }: InviteJoinPageProps) {
    const { token } = use(params);
    const router = useRouter();
    const acceptInvite = useMutation(api.invites.acceptInviteByToken);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasAutoJoined = useRef(false);

    const handleJoin = async () => {
        setIsJoining(true);
        setError(null);
        try {
            const workspaceId = await acceptInvite({ token });
            router.replace(`/workspace/${workspaceId}?tab=directories`);
        } catch {
            setError("Could not accept invitation. Please sign in and try again.");
        } finally {
            setIsJoining(false);
        }
    };

    useEffect(() => {
        if (hasAutoJoined.current) return;
        hasAutoJoined.current = true;
        void (async () => {
            setIsJoining(true);
            setError(null);
            try {
                const workspaceId = await acceptInvite({ token });
                router.replace(`/workspace/${workspaceId}?tab=directories`);
            } catch {
                setError(
                    "Could not accept invitation. Please sign in and try again.",
                );
            } finally {
                setIsJoining(false);
            }
        })();
    }, [acceptInvite, router, token]);

    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-end border-b border-border px-4 py-3">
                <UserAvatar />
            </header>
            <main className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-shopify-card">
                    <CardHeader>
                        <CardTitle>Accept invitation</CardTitle>
                        <CardDescription>
                            Joining workspace from your email invite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        {isJoining && !error && (
                            <p className="text-sm text-muted-foreground">
                                Joining workspace...
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => router.push("/")}
                        >
                            Home
                        </Button>
                        <Button
                            className="cursor-pointer"
                            disabled={isJoining}
                            onClick={() => void handleJoin()}
                        >
                            {isJoining ? "Joining..." : "Try again"}
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
