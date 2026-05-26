"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWorkspaceInviteUrl } from "@/features/workspaces/lib/invite-link";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import { cn } from "@/lib/utils";

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
                        <Copy className="size-3.5" />
                    )}
                </Button>
            </HintTooltip>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Invite link</p>
                <p className="text-sm text-muted-foreground">
                    Share this link so others can join as members.
                </p>
            </div>

            <div className="flex gap-2">
                <Input
                    readOnly
                    value={inviteUrl}
                    className={cn(
                        "h-10 min-w-0 flex-1 rounded-lg border-border bg-muted/80 text-sm text-foreground",
                        "shadow-shopify-input focus-visible:shadow-shopify-input-focus",
                    )}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={copied ? "Copied" : "Copy invite link"}
                    className="size-10 shrink-0 cursor-pointer rounded-lg border-border bg-muted/80 hover:bg-muted"
                    onClick={() => void handleCopy()}
                >
                    {copied ? (
                        <Check className="size-4 text-green-600" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </Button>
            </div>

            <p className="text-sm text-muted-foreground">
                Invite code:{" "}
                <span className="font-mono text-foreground/80">{inviteCode}</span>
            </p>
        </div>
    );
}
