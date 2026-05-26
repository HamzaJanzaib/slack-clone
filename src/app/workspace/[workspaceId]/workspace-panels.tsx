"use client";

import { useParams } from "next/navigation";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChannelSidebar } from "@/features/workspaces/components/channel-sidebar";
import { ChatbotPanel } from "@/features/workspaces/components/chatbot-panel";
import { HelpPanel } from "@/features/workspaces/components/help-panel";
import { WorkspaceSetupView } from "@/features/workspaces/components/workspace-setup-view";
import { useWorkspaceUi } from "@/features/workspaces/context/workspace-ui-context";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type WorkspacePanelsProps = {
    children: React.ReactNode;
};

export function WorkspacePanels({ children }: WorkspacePanelsProps) {
    const params = useParams();
    const workspaceId = params?.workspaceId as Id<"workspaces"> | undefined;
    const {
        chatbotOpen,
        helpOpen,
        mainView,
        channelSidebarOpen,
        setChannelSidebarOpen,
    } = useWorkspaceUi();

    const rightPanelOpen = chatbotOpen || helpOpen;

    if (!workspaceId) {
        return <div className="min-h-0 flex-1">{children}</div>;
    }

    return (
        <>
        {channelSidebarOpen && (
            <button
                type="button"
                aria-label="Close channels"
                className="fixed inset-0 z-40 bg-black/50 sm:hidden"
                onClick={() => setChannelSidebarOpen(false)}
            />
        )}
        <aside
            className={cn(
                "fixed inset-y-0 left-[68px] z-50 w-[min(100%,280px)] border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-200 sm:hidden",
                channelSidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
        >
            <ChannelSidebar />
        </aside>

        <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-0 min-w-0 flex-1 overflow-hidden"
            id={`workspace-panels-${workspaceId}`}
            defaultLayout={
                rightPanelOpen
                    ? {
                          "channel-sidebar": 22,
                          "main-content": 53,
                          "right-panel": 25,
                      }
                    : { "channel-sidebar": 22, "main-content": 78 }
            }
            resizeTargetMinimumSize={{ coarse: 28, fine: 12 }}
        >
            <ResizablePanel
                id="channel-sidebar"
                defaultSize="22%"
                minSize="15%"
                maxSize="35%"
                className="min-w-0 max-sm:hidden"
            >
                <ChannelSidebar />
            </ResizablePanel>

            <ResizableHandle
                withHandle
                className="z-10 w-px bg-border transition-colors hover:bg-primary/30 max-sm:hidden"
            />

            <ResizablePanel
                id="main-content"
                defaultSize="78%"
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

            {rightPanelOpen && (
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
        </>
    );
}
