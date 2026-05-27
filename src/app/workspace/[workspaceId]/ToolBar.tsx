"use client";

import { useParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CircleHelp,
    Clock,
    Hash,
    Menu,
    Search,
} from "lucide-react";
import { BotLogo } from "@/features/workspaces/components/bot-logo";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceUi } from "@/features/workspaces/context/workspace-ui-context";
import { useIsMobile } from "@/hooks/use-mobile";
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
    const isMobile = useIsMobile();
    const {
        chatbotOpen,
        helpOpen,
        toggleChatbot,
        toggleHelp,
        setChannelSidebarOpen,
        setChatbotOpen,
        setHelpOpen,
    } = useWorkspaceUi();

    const openChannels = () => {
        if (isMobile) {
            setChatbotOpen(false);
            setHelpOpen(false);
        }
        setChannelSidebarOpen(true);
    };

    const openAssistant = () => {
        if (isMobile) setChannelSidebarOpen(false);
        toggleChatbot();
    };

    const openHelp = () => {
        if (isMobile) setChannelSidebarOpen(false);
        toggleHelp();
    };

    const workspaceName = workspace?.name ?? "workspace";
    const searchPlaceholder = isLoading
        ? "Search..."
        : `Search ${workspaceName}`;

    return (
        <header className="flex h-12 shrink-0 items-center gap-1 border-b border-sidebar-border bg-sidebar px-2 text-sidebar-foreground max-[380px]:gap-0.5 sm:gap-2 sm:px-3">
            <div className="flex shrink-0 items-center gap-0.5">
                <ToolbarIconButton
                    label="Open sidebar"
                    className="md:hidden"
                    onClick={onOpenSidebar}
                >
                    <Menu />
                </ToolbarIconButton>
                <ToolbarIconButton
                    label="Open channels"
                    className="md:hidden"
                    onClick={openChannels}
                >
                    <Hash />
                </ToolbarIconButton>
                <div className="hidden items-center gap-0.5 md:flex">
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

            <div className="min-w-0 flex-1 md:mx-2">
                <div className="relative w-full md:mx-auto md:max-w-2xl">
                    <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-sidebar-foreground/50 sm:left-3" />
                    {isLoading ? (
                        <Skeleton className="h-8 w-full rounded-lg bg-sidebar-accent" />
                    ) : (
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            className="h-8 min-w-0 border-sidebar-border bg-sidebar-accent/80 pr-2 pl-7 text-sm text-sidebar-foreground shadow-none placeholder:truncate placeholder:text-sidebar-foreground/50 focus-visible:border-sidebar-ring focus-visible:ring-sidebar-ring/40 sm:pr-3 sm:pl-9"
                        />
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
                <ToolbarIconButton
                    label={chatbotOpen ? "Close assistant" : "Open assistant"}
                    onClick={openAssistant}
                    className={cn(
                        chatbotOpen &&
                            "bg-sidebar-accent text-sidebar-foreground",
                    )}
                >
                    <BotLogo size="xs" className="rounded-md" />
                </ToolbarIconButton>
                <ToolbarIconButton
                    label={helpOpen ? "Close help" : "Open help"}
                    onClick={openHelp}
                    className={cn(
                        helpOpen &&
                            "bg-sidebar-accent text-sidebar-foreground",
                    )}
                >
                    <CircleHelp className="size-4" />
                </ToolbarIconButton>
            </div>
        </header>
    );
}
