"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export const BOT_LOGO_PATH = "/images/bot-logo.png";

const sizeClasses = {
    icon: "size-5",
    xs: "size-7",
    sm: "size-8",
    md: "size-10",
    lg: "size-16",
} as const;

type BotLogoProps = {
    size?: keyof typeof sizeClasses;
    className?: string;
};

export function BotLogo({ size = "md", className }: BotLogoProps) {
    return (
        <span
            className={cn(
                "relative inline-flex shrink-0 overflow-hidden rounded-md",
                sizeClasses[size],
                className,
            )}
        >
            <Image
                src={BOT_LOGO_PATH}
                alt="Workspace Assistant"
                fill
                sizes="(max-width: 768px) 28px, 64px"
                className="scale-125 object-cover object-center"
                unoptimized
            />
        </span>
    );
}
