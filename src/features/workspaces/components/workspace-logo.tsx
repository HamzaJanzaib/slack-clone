"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { getWorkspaceInitials } from "@/features/workspaces/lib/workspace-utils";

type WorkspaceLogoProps = {
    name: string;
    image?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
};

const sizeClasses = {
    sm: "size-10 rounded-lg text-sm",
    md: "size-14 rounded-xl text-base",
    lg: "size-16 rounded-xl text-lg",
};

export function WorkspaceLogo({
    name,
    image,
    size = "md",
    className,
}: WorkspaceLogoProps) {
    const initials = getWorkspaceInitials(name);

    if (image) {
        return (
            <div
                className={cn(
                    "relative shrink-0 overflow-hidden border border-border bg-muted",
                    sizeClasses[size],
                    className,
                )}
            >
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center border border-border bg-linear-to-br from-violet-500/20 via-fuchsia-500/20 to-amber-500/30 font-semibold text-foreground",
                sizeClasses[size],
                className,
            )}
        >
            {initials}
        </div>
    );
}
