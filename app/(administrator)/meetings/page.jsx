import { Suspense } from "react"
import { MeetingsWrapper } from "./meetings-wrapper"
import { requireAdmin } from "@/app/actions/auth"

// This is a Server Component
export default async function MeetingsPage() {
  const session = await requireAdmin()

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-hidden">
      <Suspense fallback={<div className="text-xs">Loading meetings...</div>}>
        <MeetingsWrapper session={session} />
      </Suspense>
    </div>
  )
} 