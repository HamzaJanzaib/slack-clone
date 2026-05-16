import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AuthPageLayout } from "@/features/auth/components/auth-page-layout"

export default function OfflinePage() {
  return (
    <AuthPageLayout>
      <Card className="w-full max-w-[400px]">
        <CardHeader className="gap-1.5 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            You&apos;re offline
          </CardTitle>
          <CardDescription className="text-[#616161]">
            Check your internet connection. Cached pages may still be available
            when you reconnect.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <Button type="button" className="w-full" asChild>
            <Link href="/">Try again</Link>
          </Button>
        </CardFooter>
      </Card>
    </AuthPageLayout>
  )
}
