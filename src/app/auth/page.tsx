import { Suspense } from "react"
import AuthScreen from "@/features/auth/pages/auth-screen"
import { Skeleton } from "@/components/ui/skeleton"

const Auth = () => {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Skeleton className="h-64 w-full max-w-[400px]" />
                </div>
            }
        >
            <AuthScreen />
        </Suspense>
    )
}

export default Auth
