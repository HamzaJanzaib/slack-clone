"use client";

import { X } from "lucide-react";
import { useWorkspaceUi } from "@/features/workspaces/context/workspace-ui-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const assistantActions = [
    {
        id: "search",
        title: "Search for and find things",
        description: "Quickly locate messages, files, and people.",
    },
    {
        id: "create",
        title: "Create and manage content",
        description: "Draft messages, summarize threads, and more.",
    },
    {
        id: "manage",
        title: "Manage your time and data",
        description: "Get reminders and insights from your workspace.",
    },
];

export function ChatbotPanel() {
    const { setChatbotOpen } = useWorkspaceUi();

    return (
        <aside className="flex h-full min-h-0 w-full flex-col border-l border-border bg-card">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-bold">Workspace Assistant</h2>
                <button
                    type="button"
                    aria-label="Close assistant"
                    onClick={() => setChatbotOpen(false)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
                <div className="flex flex-col items-center text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-amber-400 text-2xl font-bold text-white shadow-lg">
                        AI
                    </div>
                    <h3 className="mt-4 text-lg font-bold">
                        Hi, I&apos;m your assistant!
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                        I can help you search, create content, and stay
                        organized in your workspace.
                    </p>
                </div>

                <ul className="mt-8 space-y-3">
                    {assistantActions.map((action) => (
                        <li
                            key={action.id}
                            className="rounded-lg border border-border bg-background px-4 py-3"
                        >
                            <p className="text-sm font-semibold">
                                {action.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {action.description}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="shrink-0 space-y-2 border-t border-border p-4">
                <Button
                    type="button"
                    className="w-full cursor-pointer"
                    onClick={() =>
                        window.alert("Assistant upgrades are coming soon.")
                    }
                >
                    Learn more
                </Button>
                <button
                    type="button"
                    onClick={() => setChatbotOpen(false)}
                    className={cn(
                        "w-full cursor-pointer text-center text-xs text-muted-foreground",
                        "underline-offset-2 hover:underline",
                    )}
                >
                    No thanks, close assistant
                </button>
            </div>
        </aside>
    );
}
