"use client"

import { UserAvatar } from "@/features/auth/components/user-avatar"

const HomePage = () => {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Top bar */}
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
                <h1 className="text-lg font-semibold tracking-tight">
                    Slack Clone
                </h1>
                <UserAvatar />
            </header>

            {/* Main content */}
            <main className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">
                    Welcome to your workspace
                </p>
            </main>
        </div>
    )
}

export default HomePage