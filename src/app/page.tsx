"use client"

import { UserAvatar } from "@/features/auth/components/user-avatar"
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces"
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal"
import { useCreateWorkspaceModel } from "@/features/workspaces/store/use-create-workspaces-create-model"
import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

const HomePage = () => {
    const { data: workspaces, isLoading } = useGetWorkspaces()
    const { isOpen, setIsOpen } = useCreateWorkspaceModel()
    const router = useRouter()
    const workspaceId = useMemo(() => workspaces?.[0]?._id, [workspaces])
    const hasWorkspaces = Boolean(workspaceId)

    useEffect(() => {
        if (isLoading) return

        if (workspaceId) {
            router.push(`/workspace/${workspaceId}`)
            return
        }

        setIsOpen(true)
    }, [isLoading, workspaceId, router, setIsOpen])

    return (
        <>
            <CreateWorkspaceModal
                open={isOpen}
                onOpenChange={setIsOpen}
                required={!hasWorkspaces && !isLoading}
            />

            <div className="flex min-h-screen flex-col">
                <header className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h1 className="text-lg font-semibold tracking-tight">
                        Slack Clone
                    </h1>
                    <UserAvatar />
                </header>

                <main className="flex flex-1 items-center justify-center">
                    {isLoading ? (
                        <Skeleton className="h-6 w-48" />
                    ) : (
                        <p className="text-muted-foreground">
                            Welcome to your workspace
                        </p>
                    )}
                </main>
            </div>
        </>
    )
}

export default HomePage
