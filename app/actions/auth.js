"use server"

import { cookies } from "next/headers"

export async function login(formData) {
  const email = formData.get("email")
  const password = formData.get("password")

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: email,
        password: password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to login")
    }

    // Store the token
    const cookieStore = await cookies()
    cookieStore.set("token", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    // Fetch user data
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate[role][populate]=*&populate[avatar][populate]=*`,
      {
        headers: {
          Authorization: `Bearer ${data.jwt}`,
        },
      }
    )

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data")
    }

    const userData = await userResponse.json()
    console.log('Login - User Data:', userData)

    if (!userData.role) {
      throw new Error("User has no role assigned")
    }

    // Store user data
    cookieStore.set("userData", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    // Return redirect path based on role
    switch (userData.role.name) {
      case "Administrator":
        return { redirect: "/admin-dashboard" }
      case "Employee":
        return { redirect: "/employee/dashboard" }
      case "Collaborator":
        return { redirect: "/collaborator/dashboard" }
      default:
        throw new Error("Unknown role")
    }
  } catch (error) {
    return { error: error.message }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("token")
  cookieStore.delete("userData")
  return { redirect: "/login" }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  const userData = cookieStore.get("userData")?.value

  if (!token || !userData) {
    return null
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate[role][populate]=*&populate[avatar][populate]=*`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Invalid session")
    }

    const sessionData = await response.json()
    console.log('getSession - User Data:', sessionData)

    return {
      token,
      user: sessionData,
    }
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    return { redirect: "/login" }
  }

  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  
  if (session.user.role?.name !== "Administrator") {
    return { redirect: "/login" }
  }

  return session
} 