import { Suspense } from "react"
import ResetPasswordScreen from "@/features/auth/pages/reset-password-screen"

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  )
}
