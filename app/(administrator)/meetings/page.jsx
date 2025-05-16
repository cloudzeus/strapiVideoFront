import { getSession } from "@/app/actions/auth"
import { MeetingsClient } from "./meetings-client"

export default async function MeetingsPage() {
  const session = await getSession()
  
  if (!session) {
    return null
  }

  return <MeetingsClient session={session} />
} 