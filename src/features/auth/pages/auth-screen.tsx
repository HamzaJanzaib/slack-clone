'use client'

import { AuthPageLayout } from '@/features/auth/components/auth-page-layout'
import { SignInCard } from '@/features/auth/components/sign-in-card'
import SignUpCard from '@/features/auth/components/sign-up-card'
import { signInFlow } from '@/features/auth/types'
import { useState } from 'react'

const AuthScreen = () => {
    const [status, setStatus] = useState<signInFlow>("signIn")
    const [isLoading, setIsLoading] = useState(false)

    return (
        <AuthPageLayout>
            {status === "signIn" ? (
                <SignInCard setStatus={setStatus} isLoading={isLoading} setIsLoading={setIsLoading} />
            ) : (
                <SignUpCard setStatus={setStatus} isLoading={isLoading} setIsLoading={setIsLoading} />
            )}
        </AuthPageLayout>
    )
}

export default AuthScreen
