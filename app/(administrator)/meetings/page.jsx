import { Suspense } from "react"
import { MeetingsWrapper } from "./meetings-wrapper"
import { requireAdmin } from "@/app/actions/auth"
import { getUsers } from "@/app/actions/users"

// This is a Server Component
export default async function MeetingsPage() {
  const session = await requireAdmin()
  const users = await getUsers()
  
  console.log('MeetingsPage - Raw users data:', users)

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-hidden">
      <Suspense fallback={<div className="text-xs">Loading meetings...</div>}>
        <MeetingsWrapper session={session} initialUsers={users} />
      </Suspense>
    </div>
  )
} 