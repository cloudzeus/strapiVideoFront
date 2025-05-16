"use client"

import { useEffect, useState } from "react"
import { format, isValid } from "date-fns"
import { Calendar, Users, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    totalMeetings: 0,
    totalOrganizations: 0
  })
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [latestUsers, setLatestUsers] = useState([])
  const [latestOrganizations, setLatestOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return isValid(date) ? format(date, "PPP") : 'Invalid Date'
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return isValid(date) ? format(date, "PPP HH:mm") : 'Invalid Date'
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (!response.ok) {
          throw new Error('No valid session')
        }
        const data = await response.json()
        setSession(data)
      } catch (error) {
        console.error('Session check failed:', error)
        router.push('/login')
      }
    }

    checkSession()
  }, [router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.token) return

      try {
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        
        // Update stats
        setStats({
          totalUsers: Array.isArray(data.users) ? data.users.length : 0,
          activeSessions: 0,
          totalMeetings: data.meetings?.length || 0,
          totalOrganizations: data.organizations?.length || 0
        })

        // Get upcoming meetings (next 4 closest to today)
        const now = new Date()
        const upcoming = data.meetings
          ?.filter(meeting => {
            const startTime = meeting.startTime
            if (!startTime) return false
            const meetingDate = new Date(startTime)
            return isValid(meetingDate) && meetingDate > now
          })
          .sort((a, b) => {
            const dateA = new Date(a.startTime)
            const dateB = new Date(b.startTime)
            // Calculate time difference from now
            const diffA = Math.abs(dateA - now)
            const diffB = Math.abs(dateB - now)
            // Sort by closest to now
            return diffA - diffB
          })
          .slice(0, 4) || []
        setUpcomingMeetings(upcoming)

        // Get latest users (last 4 created)
        const latest = Array.isArray(data.users) 
          ? data.users
              .filter(user => user.createdAt && isValid(new Date(user.createdAt)))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 4)
          : []
        setLatestUsers(latest)

        // Get latest organizations (last 4 created)
        const latestOrgs = Array.isArray(data.organizations)
          ? data.organizations
              .filter(org => org.createdAt && isValid(new Date(org.createdAt)))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 4)
          : []
        setLatestOrganizations(latestOrgs)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [session])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-xl hover:shadow-2xl transition-shadow">
            <h3 className="text-sm font-semibold text-gray-600">Total Users</h3>
            <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-xl hover:shadow-2xl transition-shadow">
            <h3 className="text-sm font-semibold text-gray-600">Active Sessions</h3>
            <p className="text-2xl font-bold mt-1">{stats.activeSessions}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-xl hover:shadow-2xl transition-shadow">
            <h3 className="text-sm font-semibold text-gray-600">Total Meetings</h3>
            <p className="text-2xl font-bold mt-1">{stats.totalMeetings}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-xl hover:shadow-2xl transition-shadow">
            <h3 className="text-sm font-semibold text-gray-600">Total Organizations</h3>
            <p className="text-2xl font-bold mt-1">{stats.totalOrganizations}</p>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Upcoming Meetings</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map(meeting => (
                <div key={meeting.id} className="rounded-lg border bg-card p-4 shadow-xl hover:shadow-2xl transition-all hover:bg-gray-50">
                  <div className="flex flex-col mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 uppercase">{meeting.name || 'Unnamed Meeting'}</h4>
                      <span className="text-[10px] bg-black text-white px-2 py-1 rounded-full whitespace-nowrap">
                        {formatDateTime(meeting.startTime)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="bg-black p-1 rounded-md mr-2">
                        <Calendar className="h-3 w-3 text-orange-400" />
                      </div>
                      <span className="line-clamp-1">{formatDateTime(meeting.startTime)}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="bg-black p-1 rounded-md mr-2">
                        <Users className="h-3 w-3 text-orange-400" />
                      </div>
                      <span>{meeting.users?.length || 0} Participants</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 text-sm">No upcoming meetings found</div>
            )}
          </div>
        </div>

        {/* Latest Users */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Latest Users</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {latestUsers.length > 0 ? (
              latestUsers.map(user => (
                <div key={user.id} className="rounded-lg border bg-card p-4 shadow-xl hover:shadow-2xl transition-all hover:bg-gray-50">
                  <div className="flex flex-col mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 uppercase">{user.username || user.email || 'Unnamed User'}</h4>
                      <span className="text-[10px] bg-black text-white px-2 py-1 rounded-full whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {user.email || 'No email provided'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Joined: {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 text-sm">No users found</div>
            )}
          </div>
        </div>

        {/* Latest Organizations */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Latest Organizations</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {latestOrganizations.length > 0 ? (
              latestOrganizations.map(org => (
                <div key={org.id} className="rounded-lg border bg-card p-4 shadow-xl hover:shadow-2xl transition-all hover:bg-gray-50">
                  <div className="flex flex-col mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 uppercase">{org.name || 'Unnamed Organization'}</h4>
                      <span className="text-[10px] bg-black text-white px-2 py-1 rounded-full whitespace-nowrap">
                        {formatDate(org.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="bg-black p-1 rounded-full mr-2">
                        <Building2 className="h-3 w-3 text-orange-400" />
                      </div>
                      <span>{org.departments?.length || 0} Departments</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(org.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 text-sm">No organizations found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
