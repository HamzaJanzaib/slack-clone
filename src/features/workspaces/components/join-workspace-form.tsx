"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJoinWorkspaceByInvite } from "@/features/workspaces/api/use-join-workspace-by-invite";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import { CircleHelp } from "lucide-react";

function parseInviteCode(input: string): string {
    const trimmed = input.trim();
    const fromUrl = trimmed.match(/\/join\/([a-z0-9]+)/i);
    if (fromUrl) return fromUrl[1];
    return trimmed;
}

export function JoinWorkspaceForm() {
    const router = useRouter();
    const joinWorkspace = useJoinWorkspaceByInvite();
    const [inviteInput, setInviteInput] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const inviteCode = parseInviteCode(inviteInput);
        if (!inviteCode) {
            setError("Enter an invite code or link");
            return;
        }

        setIsJoining(true);
        setError(null);
        try {
            const workspaceId = await joinWorkspace({ inviteCode });
            router.push(`/workspace/${workspaceId}`);
        } catch {
            setError("Invalid invite code. Please try again.");
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <form onSubmit={handleJoin} className="grid w-full gap-2">
            <div className="flex items-center gap-1.5">
                <Label htmlFor="invite-code">Join with invite code</Label>
                <HintTooltip content="Paste the invite link or code shared by a workspace admin">
                    <button
                        type="button"
                        className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                        <CircleHelp className="size-3.5" />
                    </button>
                </HintTooltip>
            </div>
            <div className="flex gap-2">
                <Input
                    id="invite-code"
                    placeholder="Paste code or invite link"
                    value={inviteInput}
                    onChange={(e) => {
                        setInviteInput(e.target.value);
                        if (error) setError(null);
                    }}
                    disabled={isJoining}
                    className="border-(--shopify-input-border) shadow-shopify-input focus:shadow-shopify-input-focus"
                />
                <Button
                    type="submit"
                    disabled={isJoining || !inviteInput.trim()}
                    className="shrink-0 cursor-pointer"
                >
                    {isJoining ? "Joining..." : "Join"}
                </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
    );
}
