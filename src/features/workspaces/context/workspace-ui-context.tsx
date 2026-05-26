"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    DEFAULT_WORKSPACE_TAB,
    WORKSPACE_TAB_PARAM,
    WorkspaceTab,
    channelTabId,
    getChannelIdFromTab,
    isSetupTab,
    parseWorkspaceTab,
} from "@/features/workspaces/lib/workspace-tab";

export type WorkspaceMainView = "setup" | "default";

type WorkspaceUiContextValue = {
    chatbotOpen: boolean;
    toggleChatbot: () => void;
    setChatbotOpen: (open: boolean) => void;
    channelSidebarOpen: boolean;
    setChannelSidebarOpen: (open: boolean) => void;
    tab: WorkspaceTab;
    setTab: (tab: WorkspaceTab) => void;
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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [channelSidebarOpen, setChannelSidebarOpen] = useState(false);

    const tabParam = searchParams.get(WORKSPACE_TAB_PARAM);
    const tab =
        parseWorkspaceTab(tabParam) ?? DEFAULT_WORKSPACE_TAB;

    const setTab = useCallback(
        (nextTab: WorkspaceTab) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(WORKSPACE_TAB_PARAM, nextTab);
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, {
                scroll: false,
            });
        },
        [pathname, router, searchParams],
    );

    const mainView: WorkspaceMainView = isSetupTab(tab) ? "setup" : "default";
    const activeChannelId = getChannelIdFromTab(tab);

    const setMainView = useCallback(
        (view: WorkspaceMainView) => {
            if (view === "setup") {
                setTab("setup");
                return;
            }
            setTab(activeChannelId ? channelTabId(activeChannelId) : "huddles");
        },
        [activeChannelId, setTab],
    );

    const setActiveChannelId = useCallback(
        (id: string | null) => {
            setTab(id ? channelTabId(id) : "huddles");
        },
        [setTab],
    );

    useEffect(() => {
        if (memberCount === undefined) return;

        const seen = localStorage.getItem(setupStorageKey(workspaceId));
        if (!seen && memberCount <= 1 && !tabParam) {
            setTab("setup");
        }
    }, [workspaceId, memberCount, tabParam, setTab]);

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
            tab,
            setTab,
            mainView,
            setMainView,
            activeChannelId,
            setActiveChannelId,
        }),
        [
            chatbotOpen,
            toggleChatbot,
            channelSidebarOpen,
            tab,
            setTab,
            mainView,
            setMainView,
            activeChannelId,
            setActiveChannelId,
        ],
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
