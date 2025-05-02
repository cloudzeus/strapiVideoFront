import { Suspense } from "react"
import { OrganizationsWrapper } from "./organizations-wrapper"

// This is a Server Component
export default async function OrganizationsPage() {
  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-hidden">
      <Suspense fallback={<div className="text-xs">Loading organizations...</div>}>
        <OrganizationsWrapper />
      </Suspense>
    </div>
  )
} 