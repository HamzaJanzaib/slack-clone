"use client";

import { useParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CircleHelp,
    Clock,
    Menu,
    Search,
} from "lucide-react";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

function ToolbarIconButton({
    label,
    children,
    className,
    ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className={cn(
                "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </Button>
    );
}

type ToolBarProps = {
    onOpenSidebar: () => void;
};

export default function ToolBar({ onOpenSidebar }: ToolBarProps) {
    const params = useParams();
    const workspaceId = params?.workspaceId as Id<"workspaces"> | undefined;
    const { data: workspace, isLoading } = useGetWorkspace(workspaceId);

    const workspaceName = workspace?.name ?? "workspace";
    const searchPlaceholder = isLoading
        ? "Search..."
        : `Search ${workspaceName}`;

    return (
        <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-sidebar-border bg-sidebar px-2 text-sidebar-foreground sm:gap-2 sm:px-3">
            <div className="flex shrink-0 items-center gap-0.5">
                <ToolbarIconButton
                    label="Open sidebar"
                    className="md:hidden"
                    onClick={onOpenSidebar}
                >
                    <Menu />
                </ToolbarIconButton>
                <div className="hidden items-center gap-0.5 sm:flex">
                    <ToolbarIconButton label="Go back">
                        <ArrowLeft />
                    </ToolbarIconButton>
                    <ToolbarIconButton label="Go forward">
                        <ArrowRight />
                    </ToolbarIconButton>
                    <ToolbarIconButton
                        label="History"
                        className="hidden md:inline-flex"
                    >
                        <Clock />
                    </ToolbarIconButton>
                </div>
            </div>

            <div className="min-w-0 flex-1 sm:mx-1 md:mx-2">
                <div className="relative w-full md:mx-auto md:max-w-2xl">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-sidebar-foreground/50 sm:left-3" />
                    {isLoading ? (
                        <Skeleton className="h-8 w-full rounded-lg bg-sidebar-accent" />
                    ) : (
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            className="h-8 border-sidebar-border bg-sidebar-accent/80 pr-2 pl-8 text-sm text-sidebar-foreground shadow-none placeholder:truncate placeholder:text-sidebar-foreground/50 focus-visible:border-sidebar-ring focus-visible:ring-sidebar-ring/40 sm:pr-3 sm:pl-9"
                        />
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center">
                <ToolbarIconButton label="Help">
                    <CircleHelp />
                </ToolbarIconButton>
            </div>
        </header>
    );
}
