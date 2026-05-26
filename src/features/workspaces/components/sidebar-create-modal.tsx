"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    FileText,
    Hash,
    Headphones,
    ListTodo,
    MessageSquarePlus,
    UserPlus,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarCreateModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type CreateItem = {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    iconClassName: string;
    shortcut?: string;
    badge?: string;
};

const createItems: CreateItem[] = [
    {
        id: "message",
        title: "Message",
        description: "Start a conversation in a DM or channel.",
        icon: <MessageSquarePlus className="size-4" />,
        iconClassName: "bg-primary/15 text-primary",
        shortcut: "Ctrl+N",
    },
    {
        id: "channel",
        title: "Channel",
        description: "Start a group conversation by topic.",
        icon: <Hash className="size-4" />,
        iconClassName: "bg-muted text-muted-foreground",
    },
    {
        id: "huddle",
        title: "Huddle",
        description: "Start a video or audio chat.",
        icon: <Headphones className="size-4" />,
        iconClassName: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    {
        id: "canvas",
        title: "Canvas",
        description: "Create and share content.",
        icon: <FileText className="size-4" />,
        iconClassName: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
        badge: "PRO",
    },
    {
        id: "list",
        title: "List",
        description: "Track and manage projects.",
        icon: <ListTodo className="size-4" />,
        iconClassName: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        badge: "PRO",
    },
];

function handleUnderConstruction() {
    window.alert("This feature is under construction.");
}

export function SidebarCreateModal({
    open,
    onOpenChange,
}: SidebarCreateModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="gap-0 p-0 sm:max-w-sm md:left-20 md:top-auto md:bottom-20 md:max-w-sm md:translate-x-0 md:translate-y-0"
                showCloseButton={false}
            >
                <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-4 py-3">
                    <DialogTitle className="text-base">Create</DialogTitle>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={() => onOpenChange(false)}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </DialogHeader>

                <div className="flex flex-col py-1">
                    {createItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={handleUnderConstruction}
                            className="flex cursor-pointer items-start gap-3 px-4 py-3 text-left outline-none hover:bg-accent"
                        >
                            <div
                                className={cn(
                                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                                    item.iconClassName,
                                )}
                            >
                                {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">
                                        {item.title}
                                    </span>
                                    {item.badge && (
                                        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                                            {item.badge}
                                        </span>
                                    )}
                                    {item.shortcut && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {item.shortcut}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="border-t border-border py-1">
                    <button
                        type="button"
                        onClick={handleUnderConstruction}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none hover:bg-accent"
                    >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <UserPlus className="size-4" />
                        </div>
                        <span className="text-sm font-semibold">
                            Invite people
                        </span>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
