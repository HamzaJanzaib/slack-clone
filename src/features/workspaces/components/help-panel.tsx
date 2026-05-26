"use client";

import { BookOpen, CircleHelp, Keyboard, LifeBuoy, X } from "lucide-react";
import { useWorkspaceUi } from "@/features/workspaces/context/workspace-ui-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const helpTopics = [
    {
        id: "getting-started",
        title: "Getting started",
        description: "Learn the basics of channels, messages, and workspaces.",
        icon: BookOpen,
    },
    {
        id: "shortcuts",
        title: "Keyboard shortcuts",
        description: "Navigate faster with quick keys and commands.",
        icon: Keyboard,
    },
    {
        id: "support",
        title: "Contact support",
        description: "Get help from our team or browse the help center.",
        icon: LifeBuoy,
    },
] as const;

export function HelpPanel() {
    const { setHelpOpen } = useWorkspaceUi();

    return (
        <aside className="flex h-full min-h-0 w-full flex-col border-l border-border bg-card">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground">
                        <CircleHelp className="size-4" />
                    </span>
                    <h2 className="truncate text-sm font-bold">Help</h2>
                </div>
                <button
                    type="button"
                    aria-label="Close help"
                    onClick={() => setHelpOpen(false)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
                <div className="flex flex-col items-center text-center">
                    <span className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500/20 via-blue-500/20 to-indigo-500/30 text-primary shadow-lg">
                        <CircleHelp className="size-8" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold">How can we help?</h3>
                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                        Find answers, learn shortcuts, and get support for your
                        workspace.
                    </p>
                </div>

                <ul className="mt-8 space-y-3">
                    {helpTopics.map((topic) => (
                        <li key={topic.id}>
                            <button
                                type="button"
                                onClick={() =>
                                    window.alert(
                                        `${topic.title} is coming soon.`,
                                    )
                                }
                                className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left outline-none hover:bg-muted/50"
                            >
                                <topic.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <span>
                                    <p className="text-sm font-semibold">
                                        {topic.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {topic.description}
                                    </p>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="shrink-0 space-y-2 border-t border-border p-4">
                <Button
                    type="button"
                    className="w-full cursor-pointer"
                    onClick={() =>
                        window.alert("Help center is coming soon.")
                    }
                >
                    Visit help center
                </Button>
                <button
                    type="button"
                    onClick={() => setHelpOpen(false)}
                    className={cn(
                        "w-full cursor-pointer text-center text-xs text-muted-foreground",
                        "underline-offset-2 hover:underline",
                    )}
                >
                    Close help
                </button>
            </div>
        </aside>
    );
}
