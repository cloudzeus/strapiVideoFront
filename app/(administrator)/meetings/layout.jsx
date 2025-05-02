import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { requireAdmin } from "@/app/actions/auth"

export default async function MeetingsLayout({ children }) {
  const session = await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={session.user} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  )
} 