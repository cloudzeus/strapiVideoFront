"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MeetingRoomLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
