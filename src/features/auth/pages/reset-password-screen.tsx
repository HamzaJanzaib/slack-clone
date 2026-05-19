"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout"
import { ResetPasswordCard } from "@/features/auth/components/reset-password-card"

export default function ResetPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
   const code = searchParams.get("code") ?? searchParams.get("token")
  const email = searchParams.get("email")

  return (
    <AuthPageLayout>
      <ResetPasswordCard
        code={code}
        email={email}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </AuthPageLayout>
  )
}
