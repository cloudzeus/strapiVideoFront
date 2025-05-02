"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Building2, MapPin, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserDetailsPage() {
  const params = useParams()
  const userId = params.id

  const {
    data: user,
    error,
    status
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}?populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`)
        }

        const data = await response.json()
        return data.data
      } catch (error) {
        console.error("Error fetching user:", error)
        throw error
      }
    },
  })

  // Function to get initials from user name
  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Function to get image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.url?.startsWith('http')) {
      return image.url;
    }
    if (image.url) {
      return `${process.env.NEXT_PUBLIC_STRAPI_URL}${image.url}`;
    }
    return null;
  }

  if (status === "loading") {
    return <div className="p-6">Loading user details...</div>
  }

  if (status === "error") {
    return <div className="p-6 text-red-500">Error: {error.message}</div>
  }

  if (!user) {
    return <div className="p-6">User not found</div>
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">User Details</CardTitle>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="text-xs"
            >
              Back to Users
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* User Header */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                {user.avatar ? (
                  <AvatarImage
                    src={getImageUrl(user.avatar)}
                    alt={user.name}
                  />
                ) : (
                  <AvatarFallback className="bg-gray-900 text-orange-500 text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {user.role && (
                  <Badge className="bg-orange-500 text-white">
                    {user.role}
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${user.email}`} className="hover:text-primary">
                    {user.email}
                  </a>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${user.phone}`} className="hover:text-primary">
                      {user.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <p>{user.address}</p>
                          <p>{user.city}, {user.zip}</p>
                          <p>{user.country}</p>
                        </div>
                      </div>
                    )}
                    {user.birthDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(user.birthDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Role Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Role</p>
                        <p className="text-muted-foreground">{user.role || 'N/A'}</p>
                      </div>
                    </div>
                    {user.permissions && (
                      <div className="text-sm">
                        <p className="font-medium">Permissions</p>
                        <div className="mt-2 space-y-1">
                          {user.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="mr-2">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Organization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.organization ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{user.organization.name}</p>
                            <p className="text-xs text-muted-foreground">{user.organization.type}</p>
                          </div>
                        </div>
                        {user.department && (
                          <div className="text-sm">
                            <p className="font-medium">Department</p>
                            <p className="text-muted-foreground">{user.department.name}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No organization assigned</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <p className="font-medium">Last Login</p>
                        <p className="text-muted-foreground">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Account Created</p>
                        <p className="text-muted-foreground">
                          {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 