import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value
  const userData = cookieStore.get("userData")?.value

  if (!token || !userData) {
    return null
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate[role][populate]=*`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Invalid session")
    }

    return {
      token,
      user: JSON.parse(userData),
    }
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  
  if (session.user.role?.name !== "Administrator") {
    redirect("/login")
  }

  return session
} 