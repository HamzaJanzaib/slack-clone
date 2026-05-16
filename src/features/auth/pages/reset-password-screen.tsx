"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout"
import { ResetPasswordCard } from "@/features/auth/components/reset-password-card"

export default function ResetPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return (
    <AuthPageLayout>
      <ResetPasswordCard
        token={token}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </AuthPageLayout>
  )
}
