"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChannelSidebar } from "@/features/workspaces/components/channel-sidebar";
import { ChatbotPanel } from "@/features/workspaces/components/chatbot-panel";
import { HelpPanel } from "@/features/workspaces/components/help-panel";
import { TutorialModal } from "@/features/workspaces/components/tutorial-modal";
import { WorkspaceSetupView } from "@/features/workspaces/components/workspace-setup-view";
import { useWorkspaceUi } from "@/features/workspaces/context/workspace-ui-context";
import { useBodyScrollLock, useIsMobile } from "@/hooks/use-mobile";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type WorkspacePanelsProps = {
    children: React.ReactNode;
};

export function WorkspacePanels({ children }: WorkspacePanelsProps) {
    const params = useParams();
    const workspaceId = params?.workspaceId as Id<"workspaces"> | undefined;
    const isMobile = useIsMobile();
    const {
        chatbotOpen,
        helpOpen,
        mainView,
        setChatbotOpen,
        setHelpOpen,
        channelSidebarOpen,
        setChannelSidebarOpen,
    } = useWorkspaceUi();

    const rightPanelOpen = chatbotOpen || helpOpen;
    const anyOverlayOpen = channelSidebarOpen || rightPanelOpen;

    const closeRightPanel = useCallback(() => {
        setChatbotOpen(false);
        setHelpOpen(false);
    }, [setChatbotOpen, setHelpOpen]);

    useBodyScrollLock(isMobile && anyOverlayOpen);

    useEffect(() => {
        if (!isMobile || !anyOverlayOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            if (rightPanelOpen) closeRightPanel();
            else setChannelSidebarOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [
        isMobile,
        anyOverlayOpen,
        rightPanelOpen,
        closeRightPanel,
        setChannelSidebarOpen,
    ]);

    useEffect(() => {
        if (!isMobile) {
            setChannelSidebarOpen(false);
        }
    }, [isMobile, setChannelSidebarOpen]);

    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [tutorialStepId, setTutorialStepId] = useState<string | undefined>(
        undefined,
    );

    useEffect(() => {
        if (!workspaceId) return;
        if (tutorialOpen) return;

        // Show tutorial only once per workspace creation (i.e. when setup hasn't been completed yet).
        // Persisted separately from "completed" so the modal can show again if user resets tutorial.
        try {
            const completedKey = `workspace-tutorial-completed-${workspaceId}`;
            const autoShownKey = `workspace-tutorial-autoShown-${workspaceId}`;
            const setupSeenKey = `workspace-setup-seen-${workspaceId}`;

            const completed = localStorage.getItem(completedKey) === "1";
            const autoShown = localStorage.getItem(autoShownKey) === "1";
            const setupSeen = localStorage.getItem(setupSeenKey) === "1";

            if (completed) return;
            if (autoShown) return;
            if (setupSeen) return;

            // Mark as shown first to avoid double-open due to re-render.
            localStorage.setItem(autoShownKey, "1");

            // Close right-side panels so the modal is the primary focus.
            setChatbotOpen(false);
            setHelpOpen(false);

            setTutorialStepId("getting-started");
            setTutorialOpen(true);
        } catch {
            // Ignore localStorage errors (private mode, etc.)
        }
    }, [
        workspaceId,
        tutorialOpen,
        setChatbotOpen,
        setHelpOpen,
        mainView,
        isMobile,
    ]);

    if (!workspaceId) {
        return <div className="min-h-0 flex-1">{children}</div>;
    }

    const desktopDefaultLayout: Record<string, number> = rightPanelOpen
        ? {
              "channel-sidebar": 22,
              "main-content": 53,
              "right-panel": 25,
          }
        : { "channel-sidebar": 22, "main-content": 78 };

    const panelDefaultLayout: Record<string, number> = isMobile
        ? { "main-content": 100 }
        : desktopDefaultLayout;

    return (
        <>
            {isMobile && channelSidebarOpen && (
                <button
                    type="button"
                    aria-label="Close channels"
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setChannelSidebarOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-[min(100%,300px)] border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-200 ease-out md:hidden",
                    channelSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full",
                )}
                aria-hidden={!channelSidebarOpen}
            >
                <ChannelSidebar />
            </aside>

            {isMobile && rightPanelOpen && (
                <button
                    type="button"
                    aria-label="Close panel"
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={closeRightPanel}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 right-0 z-50 w-[min(100%,360px)] shadow-xl transition-transform duration-200 ease-out md:hidden",
                    rightPanelOpen ? "translate-x-0" : "translate-x-full",
                )}
                aria-hidden={!rightPanelOpen}
            >
                {helpOpen ? <HelpPanel /> : <ChatbotPanel />}
            </aside>

            <ResizablePanelGroup
                orientation="horizontal"
                className="min-h-0 min-w-0 flex-1 overflow-hidden"
                id={`workspace-panels-${workspaceId}`}
                defaultLayout={panelDefaultLayout}
                resizeTargetMinimumSize={{ coarse: 28, fine: 12 }}
            >
                {!isMobile && (
                    <>
                        <ResizablePanel
                            id="channel-sidebar"
                            defaultSize="22%"
                            minSize="15%"
                            maxSize="35%"
                            className="min-w-0"
                        >
                            <ChannelSidebar />
                        </ResizablePanel>

                        <ResizableHandle
                            withHandle
                            className="z-10 w-px bg-border transition-colors hover:bg-primary/30"
                        />
                    </>
                )}

                <ResizablePanel
                    id="main-content"
                    defaultSize={isMobile ? "100%" : rightPanelOpen ? "53%" : "78%"}
                    minSize="30%"
                    className="min-w-0"
                >
                    <div className="scrollbar-hide flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden bg-background">
                        {mainView === "setup" ? (
                            <WorkspaceSetupView />
                        ) : (
                            children
                        )}
                    </div>
                </ResizablePanel>

                {!isMobile && rightPanelOpen && (
                    <>
                        <ResizableHandle
                            withHandle
                            className="z-10 w-px bg-border transition-colors hover:bg-primary/30"
                        />
                        <ResizablePanel
                            id="right-panel"
                            defaultSize="25%"
                            minSize="18%"
                            maxSize="40%"
                            className="min-w-0"
                        >
                            {helpOpen ? <HelpPanel /> : <ChatbotPanel />}
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>

            <TutorialModal
                open={tutorialOpen}
                onOpenChange={setTutorialOpen}
                initialStepId={tutorialStepId}
            />
        </>
    );
}
