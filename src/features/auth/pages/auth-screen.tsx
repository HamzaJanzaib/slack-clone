'use client'

import { SignInCard } from '@/features/auth/components/sign-in-card'
import SignUpCard from '@/features/auth/components/sign-up-card'
import { signInFlow } from '@/features/auth/types'
import React, { useState } from 'react'

const AuthScreen = () => {

    const [status, setStatus] = useState<signInFlow>("signIn")
    const [isLoading, setIsLoading] = useState(false)

    return (
        <div className="flex h-screen items-center justify-center bg-[#303030]">
            <div className='md:h-auto md:w-[420px]'>
                {status === "signIn" ? (
                    <SignInCard setStatus={setStatus} isLoading={isLoading} setIsLoading={setIsLoading} />
                ) : (
                    <SignUpCard setStatus={setStatus} isLoading={isLoading} setIsLoading={setIsLoading} />
                )}
            </div>
        </div>
    )
}

export default AuthScreen