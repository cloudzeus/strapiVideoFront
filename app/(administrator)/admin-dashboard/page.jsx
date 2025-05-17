"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { isValid } from "date-fns"
import { getToken } from "@/lib/auth-client"
import { format, isValid as dateFnsIsValid } from "date-fns"
import { Calendar, Users, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    totalMeetings: 0,
    totalOrganizations: 0
  })
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [latestUsers, setLatestUsers] = useState([])
  const [latestOrgs, setLatestOrgs] = useState([])

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = await getToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      try {
        // Fetch users
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?populate=*&sort=createdAt:desc`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          cache: 'no-store'
        })

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users')
        }

        const usersData = await usersResponse.json()
        console.log("Users API Response:", usersData)

        // Fetch meetings
        const meetingsResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/meetings?populate=*&sort=startTime:asc`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          cache: 'no-store'
        })

        if (!meetingsResponse.ok) {
          throw new Error('Failed to fetch meetings')
        }

        const meetingsData = await meetingsResponse.json()
        console.log("Meetings API Response:", meetingsData)

        // Fetch organizations
        const orgsResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations?populate=departments&sort=createdAt:desc`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          cache: 'no-store'
        })

        if (!orgsResponse.ok) {
          throw new Error('Failed to fetch organizations')
        }

        const orgsData = await orgsResponse.json()
        console.log("Organizations API Response:", orgsData)

        return {
          users: usersData,
          meetings: meetingsData,
          organizations: orgsData
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error)
        throw error
      }
    },
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 0
  })

  useEffect(() => {
    if (!dashboardData) return

    console.log("Processing dashboard data:", dashboardData)

    // Update stats
    setStats({
      totalUsers: Array.isArray(dashboardData.users) ? dashboardData.users.length : 0,
      activeSessions: 0,
      totalMeetings: Array.isArray(dashboardData.meetings?.data) ? dashboardData.meetings.data.length : 0,
      totalOrganizations: Array.isArray(dashboardData.organizations?.data) ? dashboardData.organizations.data.length : 0
    })

    // Get latest users (last 4 created)
    const latest = Array.isArray(dashboardData.users) 
      ? dashboardData.users
          .filter(user => {
            const createdAt = user.createdAt
            console.log("User createdAt:", createdAt, "for user:", user.email)
            return createdAt && dateFnsIsValid(new Date(createdAt))
          })
          .sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            console.log("Comparing dates:", dateA, dateB)
            return dateB - dateA
          })
          .slice(0, 4)
      : []
    
    console.log("Latest users after processing:", latest)
    setLatestUsers(latest)

    // Get upcoming meetings
    const upcoming = Array.isArray(dashboardData.meetings?.data)
      ? dashboardData.meetings.data
          .filter(meeting => {
            const startTime = meeting.startTime
            return startTime && dateFnsIsValid(new Date(startTime)) && new Date(startTime) > new Date()
          })
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 4)
      : []

    console.log("Upcoming meetings after processing:", upcoming)
    setUpcomingMeetings(upcoming)

    // Get latest organizations
    const latestOrgs = Array.isArray(dashboardData.organizations?.data)
      ? dashboardData.organizations.data
          .filter(org => {
            const createdAt = org.createdAt
            return createdAt && dateFnsIsValid(new Date(createdAt))
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4)
      : []

    console.log("Latest organizations after processing:", latestOrgs)
    setLatestOrgs(latestOrgs)

  }, [dashboardData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Error Loading Dashboard</h2>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeetings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
          </CardContent>
        </Card>
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
                      {format(new Date(meeting.startTime), "PPP HH:mm")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <div className="bg-black p-1 rounded-md mr-2">
                      <Calendar className="h-3 w-3 text-orange-400" />
                    </div>
                    <span className="line-clamp-1">{format(new Date(meeting.startTime), "PPP HH:mm")}</span>
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
            latestUsers.map(user => {
              console.log("Rendering user:", user)
              return (
                <div key={user.id} className="rounded-lg border bg-card p-4 shadow-xl hover:shadow-2xl transition-all hover:bg-gray-50">
                  <div className="flex flex-col mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 uppercase">
                        {user.name || user.username || user.email || 'Unnamed User'}
                      </h4>
                      <span className="text-[10px] bg-black text-white px-2 py-1 rounded-full whitespace-nowrap">
                        {format(new Date(user.createdAt), "PPP")}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {user.email || 'No email provided'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Joined: {format(new Date(user.createdAt), "PPP")}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center text-gray-500 text-sm">No users found</div>
          )}
        </div>
      </div>

      {/* Latest Organizations */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Latest Organizations</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {latestOrgs.length > 0 ? (
            latestOrgs.map(org => (
              <div key={org.id} className="rounded-lg border bg-card p-4 shadow-xl hover:shadow-2xl transition-all hover:bg-gray-50">
                <div className="flex flex-col mb-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 uppercase">{org.name || 'Unnamed Organization'}</h4>
                    <span className="text-[10px] bg-black text-white px-2 py-1 rounded-full whitespace-nowrap">
                      {format(new Date(org.createdAt), "PPP")}
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
                    Created: {format(new Date(org.createdAt), "PPP")}
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
  )
}
