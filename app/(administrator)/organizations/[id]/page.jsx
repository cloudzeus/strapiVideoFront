"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Phone, Mail, Globe, Users, Building } from "lucide-react"
import { Button } from "@/components/ui/button"

// Organization types enum with colors
const ORGANIZATION_TYPES = {
  "Supplier": "bg-blue-500",
  "Customer": "bg-green-500",
  "Partner": "bg-purple-500",
  "Other": "bg-gray-500"
}

export default function OrganizationDetailsPage() {
  const params = useParams()
  const organizationId = params.id

  const {
    data: organization,
    error,
    status
  } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations/${organizationId}?populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch organization: ${response.status}`)
        }

        const data = await response.json()
        return data.data
      } catch (error) {
        console.error("Error fetching organization:", error)
        throw error
      }
    },
  })

  // Function to get initials from organization name
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
    return <div className="p-6">Loading organization details...</div>
  }

  if (status === "error") {
    return <div className="p-6 text-red-500">Error: {error.message}</div>
  }

  if (!organization) {
    return <div className="p-6">Organization not found</div>
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Organization Details</CardTitle>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="text-xs"
            >
              Back to Organizations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Organization Header */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                {organization.logo ? (
                  <AvatarImage
                    src={getImageUrl(organization.logo)}
                    alt={organization.name}
                  />
                ) : (
                  <AvatarFallback className="bg-gray-900 text-orange-500 text-xl">
                    {getInitials(organization.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{organization.name}</h2>
                {organization.type && (
                  <Badge className={`${ORGANIZATION_TYPES[organization.type] || 'bg-gray-500'} text-white`}>
                    {organization.type}
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${organization.email}`} className="hover:text-primary">
                    {organization.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${organization.phone}`} className="hover:text-primary">
                    {organization.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Organization Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p>{organization.address}</p>
                        <p>{organization.city}, {organization.zip}</p>
                        <p>{organization.country}</p>
                      </div>
                    </div>
                    {organization.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {organization.website}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">VAT Number</p>
                        <p className="text-sm">{organization.vatNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">IRS Office</p>
                        <p className="text-sm">{organization.irsOffice || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ERP Code</p>
                        <p className="text-sm">{organization.erpCode || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Departments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {organization.departments?.length > 0 ? (
                      <div className="space-y-2">
                        {organization.departments.map((dept) => (
                          <div key={dept.id} className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{dept.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No departments found</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {organization.users?.length > 0 ? (
                      <div className="space-y-2">
                        {organization.users.map((user) => (
                          <div key={user.id} className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No users found</p>
                    )}
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