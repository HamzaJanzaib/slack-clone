"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
    Bell,
    Bookmark,
    Home,
    Menu,
    MessageSquare,
    Moon,
    MoreHorizontal,
    Paperclip,
    Plus,
    Sun,
    X,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/features/workspaces/components/workspace-switcher";
import { SidebarCreateModal } from "@/features/workspaces/components/sidebar-create-modal";
import { UserAvatar } from "@/features/auth/components/user-avatar";
import { cn } from "@/lib/utils";

type NavItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    showBadge?: boolean;
};

const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: <Home className="size-5" />, showBadge: true },
    { id: "dms", label: "DMs", icon: <MessageSquare className="size-5" /> },
    { id: "activity", label: "Activity", icon: <Bell className="size-5" /> },
    { id: "files", label: "Files", icon: <Paperclip className="size-5" /> },
    { id: "later", label: "Later", icon: <Bookmark className="size-5" /> },
    { id: "more", label: "More", icon: <MoreHorizontal className="size-5" /> },
];

function handleUnderConstruction() {
    window.alert("This feature is under construction.");
}

function SidebarNavButton({
    item,
    isActive,
    onSelect,
}: {
    item: NavItem;
    isActive: boolean;
    onSelect: (id: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(item.id)}
            title={isActive ? item.label : `${item.label} — coming soon`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
                "flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-transparent px-1 py-1.5 outline-none",
                isActive &&
                    "border-black bg-sidebar-accent shadow-[0_4px_12px_0_rgba(0,0,0,0.15)] dark:border-white/10",
            )}
        >
            <span
                className={cn(
                    "relative flex size-9 items-center justify-center rounded-lg text-sidebar-foreground",
                    isActive ? "bg-sidebar-accent" : "bg-sidebar-accent/50",
                )}
            >
                {item.icon}
                {item.showBadge && (
                    <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-destructive ring-2 ring-sidebar" />
                )}
            </span>
            <span
                className={cn(
                    "max-w-full truncate px-0.5 text-[11px] leading-none font-medium",
                    isActive
                        ? "text-sidebar-foreground"
                        : "text-sidebar-foreground/70",
                )}
            >
                {item.label}
            </span>
        </button>
    );
}

type SidebarProps = {
    mobileOpen: boolean;
    onMobileClose: () => void;
};

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const [createOpen, setCreateOpen] = useState(false);
    const [activeNavId, setActiveNavId] = useState("home");
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const isDark = mounted && resolvedTheme === "dark";

    const handleNavSelect = (id: string) => {
        if (id === "home") {
            setActiveNavId("home");
            onMobileClose();
            return;
        }
        handleUnderConstruction();
    };

    return (
        <>
            <aside
                className={cn(
                    "flex w-[68px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-3 text-sidebar-foreground",
                    "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out md:static md:z-auto",
                    mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0",
                )}
            >
                <div className="flex flex-col items-center gap-3 px-2">
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={onMobileClose}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/70 outline-none hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
                    >
                        <X className="size-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="Menu"
                        onClick={handleUnderConstruction}
                        className="hidden size-8 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/70 outline-none hover:bg-sidebar-accent hover:text-sidebar-foreground md:flex"
                    >
                        <Menu className="size-4" />
                    </button>

                    <WorkspaceSwitcher />
                </div>

                <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-2">
                    {navItems.map((item) => (
                        <SidebarNavButton
                            key={item.id}
                            item={item}
                            isActive={activeNavId === item.id}
                            onSelect={handleNavSelect}
                        />
                    ))}
                </nav>

                <div className="mt-auto flex flex-col items-center gap-2.5 px-2 pt-3">
                    <button
                        type="button"
                        aria-label={createOpen ? "Close create menu" : "Create"}
                        onClick={() => setCreateOpen((open) => !open)}
                        className={cn(
                            "flex size-9 cursor-pointer items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                            createOpen
                                ? "bg-sidebar-accent text-sidebar-foreground"
                                : "bg-sidebar-accent/80 text-sidebar-foreground hover:bg-sidebar-accent",
                        )}
                    >
                        {createOpen ? (
                            <X className="size-5" />
                        ) : (
                            <Plus className="size-5" />
                        )}
                    </button>

                    <button
                        type="button"
                        aria-label={
                            isDark ? "Switch to light mode" : "Switch to dark mode"
                        }
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-sidebar-accent/80 text-sidebar-foreground outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    >
                        {!mounted ? (
                            <Moon className="size-5" />
                        ) : isDark ? (
                            <Sun className="size-5" />
                        ) : (
                            <Moon className="size-5" />
                        )}
                    </button>

                    <UserAvatar variant="sidebar" />
                </div>
            </aside>

            <SidebarCreateModal open={createOpen} onOpenChange={setCreateOpen} />
        </>
    );
}
