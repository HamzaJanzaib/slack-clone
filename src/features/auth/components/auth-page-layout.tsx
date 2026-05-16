export function AuthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen items-center justify-center bg-[#303030]">
      <div className="w-full max-w-[420px] px-4 md:px-0">{children}</div>
    </div>
  )
}
