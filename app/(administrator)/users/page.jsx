"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, Building2, Phone, MapPin, Mail } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Trash2, Video } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AddDepartmentModal } from "@/components/department/add-department-modal"
import { EditUserModal } from "@/components/user/edit-user-modal"
import { EditDepartmentModal } from "@/components/department/edit-department-modal"
import { DeleteDepartmentModal } from "@/components/department/delete-department-modal"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [isEditDepartmentModalOpen, setIsEditDepartmentModalOpen] = useState(false)
  const [isDeleteDepartmentModalOpen, setIsDeleteDepartmentModalOpen] = useState(false)

  // Fetch users data with proper error handling
  const {
    data: usersData,
    error: usersError,
    status: usersStatus,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        throw new Error("No authentication token found")
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          console.error("API Error:", response.status, response.statusText)
          throw new Error(`Failed to fetch users: ${response.status}`)
        }

        const responseData = await response.json()
        console.log("Raw API Response:", responseData)
        
        // The API returns an array directly
        if (Array.isArray(responseData)) {
          return responseData
        } else {
          console.error("Unexpected API response format:", responseData)
          return []
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        throw error
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  })

  // Fetch organizations with their departments
  const {
    data: organizationsData,
    error: orgsError,
    status: orgsStatus
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations?populate=departments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    },
  })

  // Fetch roles data
  const {
    data: rolesData,
    error: rolesError,
    status: rolesStatus
  } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users-permissions/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`)
      }

      const data = await response.json()
      return data.roles || []
    },
  })

  // Fetch departments data
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/departments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    },
  })

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Helper function to safely get user data
  const getUserData = (user) => {
    if (!user) return null
    // The API returns user data directly on the object, not under attributes
    return user
  }

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!usersData || !Array.isArray(usersData)) {
      return []
    }
    
    return usersData.filter((user) => {
      const userData = getUserData(user)
      if (!userData) return false

      const searchLower = searchQuery.toLowerCase()
      const searchableFields = [
        userData.email,
        userData.name,
        userData.lastName,
        userData.phone,
        userData.workPhone,
        userData.mobilePhone,
        userData.address,
        userData.city,
        userData.country
      ].filter(Boolean)

      return searchableFields.some(field => 
        field.toLowerCase().includes(searchLower)
      )
    })
  }, [usersData, searchQuery])

  // Handle organization selection
  const handleOrganizationChange = (value) => {
    if (!organizationsData) return
    
    const selectedOrg = organizationsData.find(org => org.id.toString() === value)
    if (selectedOrg) {
      // If the user already has a department, include it in the list
      const orgDepartments = selectedOrg.departments || []
      if (selectedUser?.department && !orgDepartments.find(d => d.id === selectedUser.department.id)) {
        setSelectedDepartments([...orgDepartments, selectedUser.department])
      } else {
        setSelectedDepartments(orgDepartments)
      }
    } else {
      setSelectedDepartments([])
    }
  }

  // Initialize departments when modal opens
  useEffect(() => {
    if (selectedUser && organizationsData) {
      const userOrg = organizationsData.find(org => org.id === selectedUser.organization?.id)
      if (userOrg) {
        const orgDepartments = userOrg.departments || []
        if (selectedUser.department && !orgDepartments.find(d => d.id === selectedUser.department.id)) {
          setSelectedDepartments([...orgDepartments, selectedUser.department])
        } else {
          setSelectedDepartments(orgDepartments)
        }
      }
    }
  }, [selectedUser, organizationsData])

  // Handle user edit
  const handleEditUser = async (formData) => {
    if (!selectedUser) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // If there's a new avatar, upload it first
      let avatarId = selectedUser.avatar?.id
      if (avatarFile) {
        const formDataAvatar = new FormData()
        formDataAvatar.append('files', avatarFile)
        
        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataAvatar,
          }
        )

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload avatar: ${uploadResponse.status}`)
        }

        const uploadData = await uploadResponse.json()
        avatarId = uploadData[0].id
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${selectedUser.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.get('email'),
            name: formData.get('name'),
            lastName: formData.get('lastName'),
            jobPosition: formData.get('jobPosition'),
            phone: formData.get('phone'),
            workPhone: formData.get('workPhone'),
            mobilePhone: formData.get('mobilePhone'),
            address: formData.get('address'),
            city: formData.get('city'),
            zip: formData.get('zip'),
            country: formData.get('country'),
            role: formData.get('role'),
            department: formData.get('department'),
            organization: formData.get('organization'),
            confirmed: formData.get('confirmed') === 'true',
            blocked: formData.get('blocked') === 'true',
            avatar: avatarId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`)
      }

      // Close modal and refresh data
      setIsEditModalOpen(false)
      setAvatarFile(null)
      setAvatarPreview(null)
      refetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  // Function to create Google Maps URL
  const getGoogleMapsUrl = (address, city, country) => {
    const query = encodeURIComponent(`${address}, ${city}, ${country}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  // Group departments by organization and sort to put Our Company first
  const departmentsByOrg = useMemo(() => {
    if (!organizationsData || !usersData) return []

    const sortedOrgs = [...organizationsData]
      .filter(org => (org.departments?.length || 0) > 0) // Filter out orgs without departments
      .sort((a, b) => {
        // First sort by type (Our Company first)
        if (a.type === 'our_company' && b.type !== 'our_company') return -1
        if (a.type !== 'our_company' && b.type === 'our_company') return 1
        
        // Then sort by name
        return a.name.localeCompare(b.name)
      })

    return sortedOrgs.map(org => {
      const orgDepartments = org.departments || []
      const departmentsWithUsers = orgDepartments.map(dept => {
        const departmentUsers = usersData.filter(user => 
          user.department?.id === dept.id
        )
        return {
          ...dept,
          users: departmentUsers
        }
      })

      return {
        ...org,
        departments: departmentsWithUsers
      }
    })
  }, [organizationsData, usersData])

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-hidden">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-none">
          <div className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xs font-medium">Users Management</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="w-[300px] pl-8 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                size="sm" 
                className="text-xs"
                onClick={() => setIsAddUserModalOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
              <Button 
                size="sm" 
                className="text-xs"
                onClick={() => setIsAddDepartmentModalOpen(true)}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <Tabs defaultValue="users" className="w-full h-full flex flex-col">
            <TabsList className="flex-none mb-4">
              <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
              <TabsTrigger value="departments" className="text-xs">Departments</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="flex-1 overflow-hidden">
              {usersStatus === "error" ? (
                <div className="text-xs">
                  Error loading users: {usersError?.message}
                </div>
              ) : usersStatus === "loading" ? (
                <div className="text-xs">Loading users...</div>
              ) : !filteredUsers.length ? (
                <div className="text-xs text-muted-foreground">
                  No users found. Status: {usersStatus}
                </div>
              ) : (
                <div className="h-[calc(100%-3rem)] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-1">
                    {filteredUsers.map((user) => {
                      const userData = getUserData(user)
                      if (!userData) return null

                      const avatarUrl = userData.avatar?.url || null
                      
                      return (
                        
                        <Card key={user.id} className="h-[280px] hover:bg-gray-300 shadow-2xl hover:border-1">
                          <CardContent className="p-3 h-full">
                            <div className="flex gap-4 h-full">
                              {/* Avatar Section - Left Side */}
                              <div className="flex items-center pb-[45px]">
                                <Avatar className="h-[90px] w-[90px] bg-black">
                                  <AvatarImage 
                                    src={avatarUrl}
                                    alt={`${userData.name || ''} ${userData.lastName || ''}`.trim() || userData.email}
                                  />
                                  <AvatarFallback className="bg-black text-white">
                                    {userData.name?.[0]?.toUpperCase() || userData.email?.[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </div>

                              {/* Content Section - Right Side */}
                              <div className="flex-1 flex flex-col">
                                {/* User Info */}
                                <div className="space-y-1">
                                  <p className="text-sm font-medium uppercase">
                                    {`${userData.name || ''} ${userData.lastName || ''}`.trim() || userData.email}
                                  </p>
                                  <p className="text-[10px] font-gray-500 truncate max-w-[45ch]">
                                    {userData.organization?.name || "No Organization"}
                                  </p>
                                  {userData.jobPosition && (
                                    <Badge className="bg-black text-white text-[10px]">
                                      {userData.jobPosition} 
                                    </Badge>
                                  )}
                                  <span className="text-[12px] font-gray-500 truncate max-w-[45ch]">
                                    {" "+userData.department?.name || "No Department"}
                                  </span>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mt-4">
                                  {/* Phones */}
                                  {(userData.phone || userData.workPhone || userData.mobilePhone) && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-3 w-3 text-black" />
                                      <div className="flex items-center gap-2">
                                        {userData.phone && (
                                          <a 
                                            href={`tel:${userData.phone}`}
                                            className="text-xs text-muted-foreground hover:text-primary"
                                          >
                                            {userData.phone}
                                          </a>
                                        )}
                                        {userData.workPhone && (
                                          <>
                                            <p className="text-xs text-muted-foreground">•</p>
                                            <a 
                                              href={`tel:${userData.workPhone}`}
                                              className="text-xs text-muted-foreground hover:text-primary"
                                            >
                                              {userData.workPhone}
                                            </a>
                                          </>
                                        )}
                                        {userData.mobilePhone && (
                                          <>
                                            <p className="text-xs text-muted-foreground">•</p>
                                            <a 
                                              href={`tel:${userData.mobilePhone}`}
                                              className="text-xs text-muted-foreground hover:text-primary"
                                            >
                                              {userData.mobilePhone}
                                            </a>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Email */}
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-black" />
                                    <a 
                                      href={`mailto:${userData.email}`}
                                      className="text-xs text-muted-foreground hover:text-primary"
                                    >
                                      {userData.email}
                                    </a>
                                  </div>

                                  {/* Address */}
                                  {(userData.address || userData.city || userData.country) && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-3 w-3 text-black" />
                                      <a 
                                        href={getGoogleMapsUrl(userData.address, userData.city, userData.country)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground hover:text-primary"
                                      >
                                        {[userData.address, userData.city, userData.country].filter(Boolean).join(', ')}
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 justify-end mt-auto">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 rounded-[8px] bg-gray-900"
                                          onClick={() => {
                                            setSelectedUser(user)
                                            setIsEditModalOpen(true)
                                          }}
                                        >
                                          <Pencil className="h-3 w-3 text-orange-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black text-orange-500 text-xs">
                                        Edit User
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[8px] bg-gray-900">
                                          <Trash2 className="h-3 w-3 text-orange-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black text-orange-500 text-xs">
                                        Delete User
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[8px] bg-gray-900">
                                          <Video className="h-3 w-3 text-orange-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black text-orange-500 text-xs">
                                        Add to Meeting
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        
                        
                      )
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="departments" className="flex-1 overflow-hidden">
              <div className="h-[calc(100%-3rem)] overflow-y-auto">
                {departmentsByOrg.map((org) => (
                  <div key={org.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <h3 className="text-xs font-semibold">
                        {org.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        ({org.departments.length} departments)
                      </span>
                    </div>
                    {org.departments.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                        {org.departments.map((dept) => (
                          <Card key={dept.id} className="h-[200px] shadow-2xl hover:bg-gray-300">
                            <CardContent className="p-3 h-full flex flex-col tracking-wider ">
                              <div className="flex flex-col gap-1 flex-1">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-medium truncate uppercase">
                                    {dept.name}
                                  </p>
                                  <p className="text-[12px] text-muted-foreground tracking-wider">
                                    {dept.users.length} members
                                  </p>
                                </div>
                                
                                <div className="flex-1 min-h-0">
                                  <div className="flex flex-wrap gap-1">
                                    {dept.users.map((user) => (
                                      <TooltipProvider key={user.id}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Avatar className="h-10 w-10">
                                              <AvatarImage 
                                                src={user.avatar?.url || null}
                                                alt={`${user.name || ''} ${user.lastName || ''}`.trim() || user.email}
                                              />
                                              <AvatarFallback className="text-[12px] bg-black text-white">
                                                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                          </TooltipTrigger>
                                          <TooltipContent className="bg-black text-orange-500 text-xs">
                                            {`${user.name || ''} ${user.lastName || ''}`.trim() || user.email}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 mt-auto">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6 rounded-[6px] bg-gray-900"
                                          onClick={() => {
                                            setSelectedDepartment(dept)
                                            setIsEditDepartmentModalOpen(true)
                                          }}
                                        >
                                          <Pencil className="h-3 w-3 text-orange-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black text-orange-500 text-xs">
                                        Edit Department
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6 rounded-[6px] bg-gray-900"
                                          onClick={() => {
                                            setSelectedDepartment(dept)
                                            setIsDeleteDepartmentModalOpen(true)
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3 text-orange-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-black text-orange-500 text-xs">
                                        Delete Department
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground px-1">
                        No departments available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xs">Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleEditUser(formData)
            }}>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={avatarPreview || selectedUser.avatar?.url || null} 
                      alt={`${selectedUser.name || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.email}
                    />
                    <AvatarFallback>
                      {selectedUser.name?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="avatar" className="text-xs cursor-pointer">
                      Change Avatar
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => document.getElementById('avatar').click()}
                    >
                      Upload New Avatar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs">First Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={selectedUser.name || ''}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={selectedUser.lastName || ''}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={selectedUser.email || ''}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobPosition" className="text-xs">Job Position</Label>
                    <Input
                      id="jobPosition"
                      name="jobPosition"
                      defaultValue={selectedUser.jobPosition || ''}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="text-xs">Organization</Label>
                    <Select 
                      name="organization" 
                      defaultValue={selectedUser.organization?.id?.toString() || ''}
                      onValueChange={handleOrganizationChange}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {organizationsData?.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()} className="text-xs">
                            <span className="truncate max-w-[200px] block">
                              {org.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-xs">Department</Label>
                    <Select 
                      name="department" 
                      defaultValue={selectedUser.department?.id?.toString() || ''}
                      disabled={!selectedUser.organization?.id}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder={selectedUser.organization?.id ? "Select a department" : "Select organization first"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {selectedDepartments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()} className="text-xs">
                            <span className="truncate max-w-[200px] block">
                              {dept.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={selectedUser.phone || ''}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workPhone" className="text-xs">Work Phone</Label>
                    <Input
                      id="workPhone"
                      name="workPhone"
                      defaultValue={selectedUser.workPhone || ''}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobilePhone" className="text-xs">Mobile Phone</Label>
                    <Input
                      id="mobilePhone"
                      name="mobilePhone"
                      defaultValue={selectedUser.mobilePhone || ''}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={selectedUser.address || ''}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs">City</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={selectedUser.city || ''}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip" className="text-xs">ZIP Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      defaultValue={selectedUser.zip || ''}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      defaultValue={selectedUser.country || ''}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs">Role</Label>
                    <Select name="role" defaultValue={selectedUser.role?.id?.toString()}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {rolesData?.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()} className="text-xs">
                            <span className="truncate max-w-[200px] block">
                              {role.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="confirmed"
                        name="confirmed"
                        defaultChecked={selectedUser.confirmed}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="confirmed" className="text-xs">Confirmed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="blocked"
                        name="blocked"
                        defaultChecked={selectedUser.blocked}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="blocked" className="text-xs">Blocked</Label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setAvatarFile(null)
                    setAvatarPreview(null)
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-xs">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Department Modal */}
      <AddDepartmentModal
        open={isAddDepartmentModalOpen}
        onOpenChange={setIsAddDepartmentModalOpen}
        onSave={() => {
          refetchUsers()
        }}
      />

      {/* Add User Modal */}
      <EditUserModal
        open={isAddUserModalOpen}
        onOpenChange={setIsAddUserModalOpen}
        onSave={() => {
          refetchUsers()
        }}
      />

      {/* Edit Department Modal */}
      {selectedDepartment && (
        <EditDepartmentModal
          open={isEditDepartmentModalOpen}
          onOpenChange={setIsEditDepartmentModalOpen}
          department={selectedDepartment}
          onSave={() => {
            refetchUsers()
          }}
        />
      )}

      {/* Delete Department Modal */}
      {selectedDepartment && (
        <DeleteDepartmentModal
          open={isDeleteDepartmentModalOpen}
          onOpenChange={setIsDeleteDepartmentModalOpen}
          department={selectedDepartment}
          onSave={() => {
            refetchUsers()
          }}
        />
      )}
    </div>
  )
} 