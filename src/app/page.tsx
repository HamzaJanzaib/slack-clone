"use client"

import { UserAvatar } from "@/features/auth/components/user-avatar"
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces"
import { useCreateWorkspaceModel } from "@/features/workspaces/store/use-create-workspaces-create-model"
import { WorkspacePicker } from "@/features/workspaces/components/workspace-picker"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

const HomePage = () => {
    const { data: workspaces, isLoading } = useGetWorkspaces()
    const { setIsOpen } = useCreateWorkspaceModel()
    const router = useRouter()
    const pathname = usePathname()

    const workspaceCount = workspaces?.length ?? 0

    useEffect(() => {
        if (isLoading) return
        // Only prompt to create a workspace on the home page itself
        if (pathname !== "/") return

        if (workspaceCount === 0) {
            setIsOpen(true)
            return
        }

        if (workspaceCount === 1 && workspaces?.[0]) {
            router.replace(`/workspace/${workspaces[0]._id}`)
        }
    }, [isLoading, workspaceCount, workspaces, router, setIsOpen, pathname])

    const showPicker = !isLoading && workspaceCount > 1
    const showEmptyHint = !isLoading && workspaceCount === 0
    const showRedirecting = !isLoading && workspaceCount === 1

    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
                <h1 className="text-lg font-semibold tracking-tight">
                    Slack Clone
                </h1>
                <UserAvatar />
            </header>

            <main className="flex flex-1 justify-center px-4 py-8 sm:px-8">
                {isLoading && <Skeleton className="h-64 w-full max-w-2xl" />}
                {showRedirecting && (
                    <p className="text-muted-foreground">
                        Opening your workspace...
                    </p>
                )}
                {showEmptyHint && (
                    <p className="text-muted-foreground">
                        Create a workspace to get started.
                    </p>
                )}
                {showPicker && workspaces && (
                    <WorkspacePicker workspaces={workspaces} />
                )}
            </main>
        </div>
    )
}

export default HomePage
