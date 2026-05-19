"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getWorkspaceInviteUrl } from "@/features/workspaces/lib/invite-link";
import { HintTooltip } from "@/components/ui/hint-tooltip";

type WorkspaceSharePanelProps = {
    inviteCode: string;
    compact?: boolean;
};

export function WorkspaceSharePanel({
    inviteCode,
    compact = false,
}: WorkspaceSharePanelProps) {
    const [copied, setCopied] = useState(false);
    const inviteUrl = getWorkspaceInviteUrl(inviteCode);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const input = document.createElement("input");
            input.value = inviteUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (compact) {
        return (
            <HintTooltip
                content="Copy invite link — share it so others can join as members"
                side="left"
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 shrink-0 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        void handleCopy();
                    }}
                >
                    {copied ? (
                        <Check className="size-3.5 text-green-600" />
                    ) : (
                        <Link2 className="size-3.5" />
                    )}
                </Button>
            </HintTooltip>
        );
    }

    return (
        <div className="grid gap-3">
            <Label>Invite link</Label>
            <p className="text-xs text-muted-foreground">
                Share this link so others can join as members.
            </p>
            <div className="flex gap-2">
                <Input readOnly value={inviteUrl} className="text-xs" />
                <HintTooltip content="Copy link to clipboard">
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 cursor-pointer"
                        onClick={() => void handleCopy()}
                    >
                        {copied ? (
                            <Check className="size-4" />
                        ) : (
                            <Copy className="size-4" />
                        )}
                    </Button>
                </HintTooltip>
            </div>
            <p className="text-xs text-muted-foreground">
                Invite code: <span className="font-mono">{inviteCode}</span>
            </p>
        </div>
    );
}
