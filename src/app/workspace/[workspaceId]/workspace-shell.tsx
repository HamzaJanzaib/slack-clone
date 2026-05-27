"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/app/workspace/[workspaceId]/sidebar";
import ToolBar from "@/app/workspace/[workspaceId]/ToolBar";
import { useBodyScrollLock, useIsMobile } from "@/hooks/use-mobile";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isMobile = useIsMobile();

    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const openSidebar = useCallback(() => setSidebarOpen(true), []);

    useEffect(() => {
        if (!isMobile) {
            setSidebarOpen(false);
        }
    }, [isMobile]);

    useBodyScrollLock(isMobile && sidebarOpen);

    useEffect(() => {
        if (!sidebarOpen || !isMobile) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeSidebar();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [sidebarOpen, isMobile, closeSidebar]);

    return (
        <div className="workspace-app flex h-dvh overflow-hidden bg-background pt-[env(safe-area-inset-top)]">
            {sidebarOpen && isMobile && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            <Sidebar
                mobileOpen={sidebarOpen}
                onMobileClose={closeSidebar}
            />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <ToolBar onOpenSidebar={openSidebar} />
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}
