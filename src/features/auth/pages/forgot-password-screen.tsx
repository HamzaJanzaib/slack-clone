"use client"

import { useState } from "react"
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout"
import { ForgotPasswordCard } from "@/features/auth/components/forgot-password-card"

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AuthPageLayout>
      <ForgotPasswordCard isLoading={isLoading} setIsLoading={setIsLoading} />
    </AuthPageLayout>
  )
}
