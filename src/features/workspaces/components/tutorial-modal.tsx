"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    BookOpen,
    CircleCheck,
    Keyboard,
    LifeBuoy,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { LucideIcon } from "lucide-react";

type TutorialStep = {
    id: string;
    title: string;
    description: string;
    bullets: string[];
    icon: LucideIcon;
};

const STORAGE_LAST_STEP = (workspaceId: string) =>
    `workspace-tutorial-lastStep-${workspaceId}`;
const STORAGE_COMPLETED = (workspaceId: string) =>
    `workspace-tutorial-completed-${workspaceId}`;

export function TutorialModal({
    open,
    onOpenChange,
    initialStepId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialStepId?: string;
}) {
    const params = useParams();
    const workspaceId = (params?.workspaceId as string | undefined) ?? "unknown";

    const steps = useMemo<TutorialStep[]>(
        () => [
            {
                id: "getting-started",
                title: "Getting started",
                description:
                    "Use the left sidebar to browse channels and switch between conversations.",
                bullets: [
                    "Tap Channels to see your channel list.",
                    "Select a channel to load the main view.",
                    "Use the mobile drawer for quick navigation.",
                ],
                icon: BookOpen,
            },
            {
                id: "channels-dms",
                title: "Channels and DMs",
                description:
                    "Understand the two core surfaces: public channels and direct messages.",
                bullets: [
                    "Channels are group conversations.",
                    "Direct messages are 1:1 or small-group.",
                    "Use the search box on the top bar to find content.",
                ],
                icon: BookOpen,
            },
            {
                id: "shortcuts",
                title: "Keyboard shortcuts",
                description:
                    "A few shortcuts can speed up navigation. (More coming soon.)",
                bullets: [
                    "Use `Ctrl/Cmd + F` to search within the page.",
                    "Press `Esc` to close drawers and panels.",
                    "More shortcuts will be added to this tutorial.",
                ],
                icon: Keyboard,
            },
            {
                id: "support",
                title: "Support",
                description:
                    "Need help? Use the help center and reach out to support.",
                bullets: [
                    "Try the Help panel topics to learn basics.",
                    "Restart the tutorial any time.",
                    "Contact support when something looks broken.",
                ],
                icon: LifeBuoy,
            },
        ],
        [],
    );

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!open) return;

        const completedValue = localStorage.getItem(
            STORAGE_COMPLETED(workspaceId),
        );
        setCompleted(completedValue === "1");

        if (completedValue === "1" && !initialStepId) {
            // If completed and the user didn't request a specific section, show the first step.
            setCurrentStepIndex(0);
            return;
        }

        const initialIndex = initialStepId
            ? steps.findIndex((s) => s.id === initialStepId)
            : -1;

        if (initialIndex >= 0) {
            setCurrentStepIndex(initialIndex);
            return;
        }

        const lastStepId = localStorage.getItem(
            STORAGE_LAST_STEP(workspaceId),
        );
        const lastIndex = lastStepId
            ? steps.findIndex((s) => s.id === lastStepId)
            : -1;

        setCurrentStepIndex(lastIndex >= 0 ? lastIndex : 0);
    }, [open, workspaceId, initialStepId, steps]);

    useEffect(() => {
        if (!open) return;
        const step = steps[currentStepIndex];
        if (!step) return;
        localStorage.setItem(STORAGE_LAST_STEP(workspaceId), step.id);
    }, [currentStepIndex, open, steps, workspaceId]);

    const goToStep = (nextIndex: number) => {
        const clamped = Math.max(0, Math.min(steps.length - 1, nextIndex));
        setCurrentStepIndex(clamped);
    };

    const step = steps[currentStepIndex];
    const StepIcon = step?.icon;

    const finish = () => {
        localStorage.setItem(STORAGE_COMPLETED(workspaceId), "1");
        setCompleted(true);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 p-0 sm:max-w-md">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-base">
                            Workspace tutorial
                        </DialogTitle>
                        <DialogDescription className="mt-0">
                            Step {currentStepIndex + 1} of {steps.length}
                        </DialogDescription>
                    </DialogHeader>
                    {completed && (
                        <span className="flex items-center gap-1 rounded-full bg-sidebar-accent px-3 py-1 text-xs font-semibold text-sidebar-foreground">
                            <CircleCheck className="size-3.5" />
                            Completed
                        </span>
                    )}
                </div>

                <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-foreground">
                            {StepIcon && <StepIcon className="size-5" />}
                        </span>
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold">
                                {step.title}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {step.description}
                            </p>
                            <ul className="mt-3 space-y-2">
                                {step.bullets.map((b, idx) => (
                                    <li key={`${step.id}-${idx}`} className="text-xs text-muted-foreground">
                                        • {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 border-t border-border px-4 py-3 sm:justify-between">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={currentStepIndex === 0}
                            onClick={() => goToStep(currentStepIndex - 1)}
                        >
                            Back
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={currentStepIndex === steps.length - 1}
                            onClick={() =>
                                goToStep(currentStepIndex + 1)
                            }
                        >
                            Next
                        </Button>
                    </div>

                    {currentStepIndex === steps.length - 1 ? (
                        <Button type="button" onClick={finish}>
                            Done
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStepIndex(0)}
                        >
                            Restart
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

