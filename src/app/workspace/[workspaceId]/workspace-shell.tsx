"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/app/workspace/[workspaceId]/sidebar";
import ToolBar from "@/app/workspace/[workspaceId]/ToolBar";

const MD_BREAKPOINT = 768;

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(`(max-width: ${MD_BREAKPOINT - 1}px)`);
        const update = () => setIsMobile(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    return isMobile;
}

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

    useEffect(() => {
        if (!sidebarOpen || !isMobile) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeSidebar();
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [sidebarOpen, isMobile, closeSidebar]);

    return (
        <div className="flex h-dvh overflow-hidden bg-background">
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

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <ToolBar onOpenSidebar={openSidebar} />
                {children}
            </div>
        </div>
    );
}
