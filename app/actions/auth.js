"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData) {
  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://kollerisike-backvideo.wwa.gr'
    
    // Get JWT token
    const response = await fetch(`${apiUrl}/api/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to login")
    }

    const data = await response.json()
    console.log("Login response:", data)

    if (!data.jwt) {
      throw new Error("No JWT token received")
    }

    // Get user data
    const userResponse = await fetch(`${apiUrl}/api/users/me?populate[role][populate]=*`, {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data")
    }

    const userData = await userResponse.json()
    console.log("User data fetched:", userData)

    // Set cookies
    const cookieStore = await cookies()
    
    // Set the JWT token in an HTTP-only cookie
    await cookieStore.set("token", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
    })

    // Set user data in a separate cookie
    await cookieStore.set("user", JSON.stringify({
      id: userData.id,
      email: userData.email,
      role: {
        name: userData.role.name,
        type: userData.role.type
      },
      name: userData.name || userData.username
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
    })

    // Return the data for client-side storage
    return {
      success: true,
      redirect: userData.role?.type === "administrator" ? "/admin-dashboard" : "/dashboard",
      token: data.jwt,
      user: {
        id: userData.id,
        email: userData.email,
        role: {
          name: userData.role.name,
          type: userData.role.type
        },
        name: userData.name || userData.username
      }
    }
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies()
    
    // Clear cookies
    await cookieStore.delete("token")
    await cookieStore.delete("user")
    
    return {
      success: true,
      redirect: "/login"
    }
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const token = await cookieStore.get("token")?.value
    const userData = await cookieStore.get("user")?.value

    if (!token || !userData) {
      return null
    }

    try {
      const user = JSON.parse(userData)
      return {
        token,
        user
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      return null
    }
  } catch (error) {
    console.error("Session error:", error)
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
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  if (session.user.role?.type !== "administrator") {
    redirect("/dashboard")
  }
  return session
} 