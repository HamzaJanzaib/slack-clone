"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Id } from "../../../../convex/_generated/dataModel";

export type WorkspaceMainView = "setup" | "default";

type WorkspaceUiContextValue = {
    chatbotOpen: boolean;
    toggleChatbot: () => void;
    setChatbotOpen: (open: boolean) => void;
    channelSidebarOpen: boolean;
    setChannelSidebarOpen: (open: boolean) => void;
    mainView: WorkspaceMainView;
    setMainView: (view: WorkspaceMainView) => void;
    activeChannelId: string | null;
    setActiveChannelId: (id: string | null) => void;
};

const WorkspaceUiContext = createContext<WorkspaceUiContextValue | null>(null);

function setupStorageKey(workspaceId: Id<"workspaces">) {
    return `workspace-setup-seen-${workspaceId}`;
}

export function WorkspaceUiProvider({
    workspaceId,
    memberCount,
    children,
}: {
    workspaceId: Id<"workspaces">;
    memberCount: number | undefined;
    children: React.ReactNode;
}) {
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [channelSidebarOpen, setChannelSidebarOpen] = useState(false);
    const [mainView, setMainView] = useState<WorkspaceMainView>("default");
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

    useEffect(() => {
        if (memberCount === undefined) return;

        const seen = localStorage.getItem(setupStorageKey(workspaceId));
        if (!seen && memberCount <= 1) {
            setMainView("setup");
        }
    }, [workspaceId, memberCount]);

    const toggleChatbot = useCallback(() => {
        setChatbotOpen((open) => !open);
    }, []);

    const value = useMemo(
        () => ({
            chatbotOpen,
            toggleChatbot,
            setChatbotOpen,
            channelSidebarOpen,
            setChannelSidebarOpen,
            mainView,
            setMainView,
            activeChannelId,
            setActiveChannelId,
        }),
        [chatbotOpen, toggleChatbot, channelSidebarOpen, mainView, activeChannelId],
    );

    return (
        <WorkspaceUiContext.Provider value={value}>
            {children}
        </WorkspaceUiContext.Provider>
    );
}

export function useWorkspaceUi() {
    const context = useContext(WorkspaceUiContext);
    if (!context) {
        throw new Error("useWorkspaceUi must be used within WorkspaceUiProvider");
    }
    return context;
}

export function markWorkspaceSetupSeen(workspaceId: Id<"workspaces">) {
    localStorage.setItem(setupStorageKey(workspaceId), "1");
}
