"use client"

export async function getToken() {
  // Try to get token from cookies first
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
  if (tokenCookie) {
    return tokenCookie.split('=')[1]
  }
  // Fallback to localStorage
  return localStorage.getItem('token')
}

export async function setToken(token) {
  // Store in localStorage as backup
  localStorage.setItem('token', token)
}

export async function removeToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('userData')
}

export async function getUserData() {
  // Try to get user data from cookies first
  const cookies = document.cookie.split(';')
  const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='))
  if (userCookie) {
    try {
      return JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
    } catch (e) {
      console.error('Error parsing user cookie:', e)
    }
  }
  // Fallback to localStorage
  const userData = localStorage.getItem('userData')
  return userData ? JSON.parse(userData) : null
}

export async function setUserData(userData) {
  // Store in localStorage as backup
  localStorage.setItem('userData', JSON.stringify(userData))
}

export async function clearSession() {
  removeToken()
  localStorage.removeItem('userData')
  // Force reload to clear any cached state
  window.location.href = '/login'
} 