"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"

export default function AdminDashboardLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate[role][populate]=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const userData = await response.json()
        console.log("Admin Layout - User Data:", userData)

        // Get role ID and fetch role details
        const roleId = userData.role?.id
        if (!roleId) {
          throw new Error("No role found for user")
        }

        const roleResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users-permissions/roles/${roleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!roleResponse.ok) {
          throw new Error("Failed to fetch role details")
        }

        const roleData = await roleResponse.json()
        console.log("Admin Layout - Role Data:", roleData)

        // Only allow Administrator role
        if (roleData.role?.name !== "Administrator") {
          router.push("/login")
          return
        }

        setUser(userData)
      } catch (error) {
        console.error("Error fetching data:", error)
        localStorage.removeItem("token")
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
} 