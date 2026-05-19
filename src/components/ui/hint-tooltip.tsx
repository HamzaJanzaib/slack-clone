"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type HintTooltipProps = {
    children: React.ReactNode;
    content: string;
    side?: "top" | "right" | "bottom" | "left";
    className?: string;
};

export function HintTooltip({
    children,
    content,
    side = "top",
    className,
}: HintTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild className={className}>
                {children}
            </TooltipTrigger>
            <TooltipContent side={side} sideOffset={6} className="max-w-[220px]">
                {content}
            </TooltipContent>
        </Tooltip>
    );
}
