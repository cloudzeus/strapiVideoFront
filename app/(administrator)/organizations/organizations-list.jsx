"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Building2, MapPin, Phone, Mail, Globe, Pencil, Trash2, Info, Users, Building, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries } from "@/lib/countries"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDropzone } from "react-dropzone"
import { Badge } from "@/components/ui/badge"
import Afm2Info from "@/components/organizations/afm2info"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Organization types enum with colors
const ORGANIZATION_TYPES = {
  "Customer": "bg-blue-500",
  "Supplier": "bg-green-500",
  "Collaborator": "bg-purple-500",
  "Our Company": "bg-orange-500"
}

export function OrganizationsList({ 
  searchQuery = "", 
  isAddModalOpen, 
  setIsAddModalOpen 
}) {
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    vatNumber: '',
    irsOffice: '',
    address: '',
    city: '',
    zip: '',
    country: 'Greece',
    type: '',
    email: '',
    phone: '',
    website: '',
    erpCode: '',
    logo: null
  })
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    description: '',
    organizationId: null
  })

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const queryParams = new URLSearchParams({
        'populate': '*',
        'pagination[pageSize]': '100',
        'sort': 'createdAt:desc'
      })

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        }
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched organizations:", data)
      setOrganizations(data.data || [])
    } catch (error) {
      console.error("Error fetching organizations:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchOrganizations()
  }, [])

  // Filter organizations based on search query
  const filteredOrgs = organizations?.filter((org) => {
    if (!org) return false
    const searchLower = searchQuery.toLowerCase()
    return (
      org.name?.toLowerCase().includes(searchLower) ||
      org.email?.toLowerCase().includes(searchLower) ||
      org.phone?.toLowerCase().includes(searchLower) ||
      org.address?.toLowerCase().includes(searchLower) ||
      org.city?.toLowerCase().includes(searchLower) ||
      org.country?.toLowerCase().includes(searchLower)
    )
  }) || []

  // Handle organization edit
  const handleEditOrg = async (formData) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // First verify the organization exists
      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations/${selectedOrg.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}))
        console.error('Organization verification error:', {
          status: verifyResponse.status,
          statusText: verifyResponse.statusText,
          errorData
        })
        throw new Error(`Organization not found: ${verifyResponse.statusText}`)
      }

      const currentOrg = await verifyResponse.json()
      console.log("Current organization data:", currentOrg)

      // Prepare update data
      const updateData = {
        data: {
          ...currentOrg.data,
          name: formData.get('name'),
          organizationId: formData.get('organizationId'),
          erpCode: formData.get('erpCode'),
          vatNumber: formData.get('vatNumber'),
          irsOffice: formData.get('irsOffice'),
          type: formData.get('type'),
          address: formData.get('address'),
          city: formData.get('city'),
          zip: formData.get('zip'),
          country: formData.get('country'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          website: formData.get('website'),
        }
      }

      console.log("Sending update data:", updateData)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations/${selectedOrg.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Update error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(`Failed to update organization: ${response.statusText}`)
      }

      const responseData = await response.json()
      console.log("Update successful:", responseData)

      setIsEditModalOpen(false)
      await fetchOrganizations() // Refresh the organizations list
      toast.success("Organization updated successfully")
    } catch (error) {
      console.error('Error updating organization:', error)
      toast.error(error.message || "Failed to update organization")
    }
  }

  // Handle organization add
  const handleAddOrg = async (formData) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadStatus('Preparing organization creation...')

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Validate required fields
      const requiredFields = {
        name: "Name",
        vatNumber: "VAT Number",
        email: "Email",
        phone: "Phone",
        type: "Type"
      }

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key])
        .map(([_, label]) => label)

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error("Invalid email format")
      }

      // Validate phone format (basic validation)
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
      if (!phoneRegex.test(formData.phone)) {
        throw new Error("Invalid phone number format")
      }

      console.log("Form data being sent:", formData)
      setUploadProgress(10)
      setUploadStatus('Creating organization...')

      // Create the organization
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              name: formData.name,
              vatNumber: formData.vatNumber,
              irsOffice: formData.irsOffice,
              type: formData.type,
              address: formData.address,
              city: formData.city,
              zip: formData.zip,
              country: formData.country,
              phone: formData.phone,
              email: formData.email,
              website: formData.website,
              erpCode: formData.erpCode,
              organizationId: formData.vatNumber
            }
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(`Failed to create organization: ${response.statusText}`)
      }

      const responseData = await response.json()
      console.log("Created organization:", responseData)
      setUploadProgress(50)
      setUploadStatus('Organization created. Uploading logo...')

      // Handle logo upload if there's a file
      if (formData.logo) {
        try {
          const uploadFormData = new FormData()
          uploadFormData.append('files', formData.logo)
          uploadFormData.append('ref', 'api::organization.organization')
          uploadFormData.append('refId', responseData.data.id)
          uploadFormData.append('field', 'logo')
          
          console.log("Uploading logo for organization:", responseData.data.id)
          console.log("Upload form data:", {
            file: formData.logo.name,
            ref: 'api::organization.organization',
            refId: responseData.data.id,
            field: 'logo'
          })

          const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}))
            console.error('Logo upload error:', {
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
              errorData
            })
            // Don't throw here, just log the error and continue
            console.warn(`Logo upload failed: ${uploadResponse.statusText}`)
          } else {
            const uploadData = await uploadResponse.json()
            console.log("Logo upload successful:", uploadData)
            setUploadProgress(75)
            setUploadStatus('Logo uploaded. Updating organization...')
            
            // Update organization with logo
            const updateResponse = await fetch(
              `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations/${responseData.data.id}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  data: {
                    logo: uploadData[0].id
                  }
                }),
              }
            )

            if (!updateResponse.ok) {
              console.warn('Failed to update organization with logo, but organization was created successfully')
            } else {
              console.log("Organization updated with logo successfully")
              setUploadProgress(90)
              setUploadStatus('Organization updated with logo successfully!')
            }
          }
        } catch (error) {
          // Log the error but don't throw it
          console.warn('Error during logo upload:', error)
          // Continue with organization creation
        }
      }

      setUploadProgress(100)
      setUploadStatus('Organization creation completed!')
      
      // Reset form and close modal
      setIsAddModalOpen(false)
      setFormData({
        name: '',
        vatNumber: '',
        irsOffice: '',
        address: '',
        city: '',
        zip: '',
        country: 'Greece',
        type: '',
        email: '',
        phone: '',
        website: '',
        erpCode: '',
        logo: null
      })
      
      // Refresh the organizations list
      await fetchOrganizations()
      toast.success("Organization created successfully")
    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error(error.message || "Failed to create organization")
      setUploadStatus(`Error: ${error.message}`)
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        setUploadStatus('')
      }, 2000)
    }
  }

  // Handle file drop for logo
  const onDrop = async (acceptedFiles, orgId = null) => {
    if (acceptedFiles.length === 0) return

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadStatus('Preparing file upload...')

      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append('files', file)
      formData.append('ref', 'api::organization.organization')
      formData.append('refId', orgId)
      formData.append('field', 'logo')

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      console.log("Starting file upload for organization:", orgId)
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size
      })
      
      setUploadStatus('Uploading file...')
      setUploadProgress(30)
      
      // Upload the file
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}))
        console.error('Upload error response:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          errorData
        })
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }

      const uploadData = await uploadResponse.json()
      console.log("Upload successful:", uploadData)
      setUploadProgress(60)
      setUploadStatus('File uploaded successfully. Updating organization...')
      
      if (orgId) {
        console.log("Updating organization with new logo:", orgId)
        
        // First, get the organization to verify it exists
        const getResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations/${orgId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!getResponse.ok) {
          const errorData = await getResponse.json().catch(() => ({}))
          console.error('Organization fetch error:', {
            status: getResponse.status,
            statusText: getResponse.statusText,
            errorData
          })
          throw new Error(`Organization not found: ${getResponse.statusText}`)
        }

        const orgData = await getResponse.json()
        console.log("Organization found:", orgData)
        setUploadProgress(80)

        // Then update the organization with the new logo
        const updateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations/${orgId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              data: {
                ...orgData.data,
                logo: uploadData[0].id
              }
            }),
          }
        )

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json().catch(() => ({}))
          console.error('Update error response:', {
            status: updateResponse.status,
            statusText: updateResponse.statusText,
            errorData
          })
          throw new Error(`Failed to update organization: ${updateResponse.statusText}`)
        }

        const updateData = await updateResponse.json()
        console.log("Organization updated successfully:", updateData)
        setUploadProgress(100)
        setUploadStatus('Logo update completed successfully!')

        await fetchOrganizations()
        toast.success("Logo updated successfully")
      }

      return uploadData[0]
    } catch (error) {
      console.error('Error in onDrop:', error)
      toast.error(error.message || "Failed to upload logo")
      setUploadStatus(`Error: ${error.message}`)
      return null
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        setUploadStatus('')
      }, 2000)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      try {
        if (isAddModalOpen) {
          // For new organization
          const file = files[0]
          console.log("File selected for new organization:", {
            name: file.name,
            type: file.type,
            size: file.size
          })
          setFormData(prev => ({
            ...prev,
            logo: file
          }))
          toast.success("Logo selected successfully")
        } else if (selectedOrg?.id) {
          // For existing organization
          console.log("Starting logo update for organization:", selectedOrg.id)
          await onDrop(files, selectedOrg.id)
        } else {
          console.error("No organization selected for logo update")
          toast.error("No organization selected")
        }
      } catch (error) {
        console.error('Error in dropzone onDrop:', error)
        toast.error(error.message || "Failed to handle file upload")
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    maxSize: 5242880 // 5MB
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

  const handleInputChange = (e) => {
    if (typeof e === 'object' && 'target' in e) {
      // Handle regular input changes
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      // Handle VAT data updates
      setFormData(prev => ({
        ...prev,
        ...e
      }));
    }
  };

  // Handle department creation
  const handleAddDepartment = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      if (!selectedOrg?.id) {
        throw new Error("No organization selected")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/departments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              name: departmentFormData.name,
              description: departmentFormData.description,
              organization: selectedOrg.id
            }
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Department creation error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(`Failed to create department: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Created department:", data)

      // Reset form and close modal
      setDepartmentFormData({
        name: '',
        description: '',
        organizationId: null
      })
      setIsAddDepartmentModalOpen(false)
      
      // Refresh the organizations list to show the new department
      await fetchOrganizations()
      toast.success("Department created successfully")
    } catch (error) {
      console.error('Error creating department:', error)
      toast.error(error.message || "Failed to create department")
    }
  }

  if (error) {
    return (
      <div className="text-xs text-red-500">
        Error loading organizations: {error}
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4"
          onClick={fetchOrganizations}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-xs">Loading organizations...</div>
  }

  if (!organizations?.length) {
    return (
      <div className="text-xs text-muted-foreground">
        No organizations found.
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4"
          onClick={fetchOrganizations}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="h-[calc(100%-3rem)] overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 p-1">
          {filteredOrgs.map((org) => (
            <Card key={org.id} className="h-[300px] w-full min-w-0 shadow-2xl hover:bg-gray-300">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center">
                      {org.logo ? (
                        <img
                          src={getImageUrl(org.logo)}
                          alt={org.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-lg font-medium text-orange-500">${getInitials(org.name)}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-xl font-medium text-orange-500">
                          {getInitials(org.name)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0 text-xs">
                      <p className="text-xs font-medium truncate">
                        {org.name || 'No name'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {org.email || 'No email'}
                      </p>
                      {org.type && (
                        <Badge className={`${ORGANIZATION_TYPES[org.type] || 'bg-gray-500'} text-white text-[10px]`}>
                          {org.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {org.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`tel:${org.phone}`}
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          {org.phone}
                        </a>
                      </div>
                    )}
                    {(org.address || org.city || org.country) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            [org.address, org.city, org.country].filter(Boolean).join(', ')
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          {[org.address, org.city, org.country].filter(Boolean).join(', ')}
                        </a>
                      </div>
                    )}
                    {org.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          {org.website}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
                            onClick={() => {
                              window.location.href = `/administrator/organizations/${org.id}`
                            }}
                          >
                            <Eye className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-orange-500 text-xs">
                          View Details
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
                            onClick={() => {
                              setSelectedOrg(org)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Pencil className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-orange-500 text-xs">
                          Edit Organization
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
                            onClick={() => {
                              setSelectedOrg(org)
                              setIsAddDepartmentModalOpen(true)
                            }}
                          >
                            <Building className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-orange-500 text-xs">
                          Add Department
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
                            onClick={() => {
                              setSelectedOrg(org)
                              setIsAddUserModalOpen(true)
                            }}
                          >
                            <Users className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-orange-500 text-xs">
                          Add User
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
                          >
                            <Trash2 className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-orange-500 text-xs">
                          Delete Organization
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Organization Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
          </DialogHeader>
          {selectedOrg && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleEditOrg(formData)
            }}>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-4">
                  <div {...getRootProps()} className="cursor-pointer flex flex-col items-center gap-2">
                    <input {...getInputProps()} />
                    <Avatar className="h-24 w-24">
                      {selectedOrg.logo ? (
                        <AvatarImage 
                          src={getImageUrl(selectedOrg.logo)} 
                          alt={selectedOrg.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="h-full w-full bg-gray-900 flex items-center justify-center">
                              <span class="text-lg font-medium text-orange-500">${getInitials(selectedOrg.name)}</span>
                            </div>`;
                          }}
                        />
                      ) : (
                        <AvatarFallback className="bg-gray-900 text-orange-500">
                          {getInitials(selectedOrg.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <p className="text-xs text-muted-foreground">
                      {isDragActive ? "Drop the image here" : "Click or drag to upload logo"}
                    </p>
                  </div>
                  <div className="w-full">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={selectedOrg.name}
                        className="text-xs w-full"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Number</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="vatNumber"
                        name="vatNumber"
                        value={selectedOrg.vatNumber}
                        onChange={handleInputChange}
                        placeholder="Enter VAT number"
                      />
                      <Afm2Info
                        vatNumber={selectedOrg.vatNumber}
                        onDataReceived={(data) => {
                          setSelectedOrg(prev => ({
                            ...prev,
                            ...data
                          }))
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" defaultValue={selectedOrg.type}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(ORGANIZATION_TYPES).map((type) => (
                          <SelectItem key={type} value={type} className="text-xs">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="irsOffice">IRS Office</Label>
                    <Input
                      id="irsOffice"
                      name="irsOffice"
                      value={selectedOrg.irsOffice}
                      onChange={handleInputChange}
                      placeholder="Enter IRS office"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="erpCode">ERP Code</Label>
                    <Input
                      id="erpCode"
                      name="erpCode"
                      defaultValue={selectedOrg.erpCode}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={selectedOrg.email}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={selectedOrg.phone}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    defaultValue={selectedOrg.website}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={selectedOrg.address}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={selectedOrg.city}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      defaultValue={selectedOrg.zip}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select name="country" defaultValue={selectedOrg.country || "Greece"}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country} className="text-xs">
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
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

      {/* Add Organization Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Organization</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleAddOrg(formData)
          }}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-4">
                <div {...getRootProps()} className={`cursor-pointer flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}>
                  <input {...getInputProps()} />
                  <Avatar className="h-24 w-24">
                    {formData.logo ? (
                      <AvatarImage 
                        src={URL.createObjectURL(formData.logo)} 
                        alt="Selected logo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="h-full w-full bg-gray-900 flex items-center justify-center">
                            <span class="text-lg font-medium text-orange-500">${getInitials(formData.name || 'Org')}</span>
                          </div>`;
                        }}
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-900 text-orange-500">
                        <Building2 className="h-8 w-8" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p className="text-xs text-muted-foreground">
                    {isDragActive ? "Drop the image here" : "Click or drag to upload logo"}
                  </p>
                  {isUploading && (
                    <div className="w-full mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center mt-1">{uploadStatus}</p>
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-xs w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="vatNumber"
                      name="vatNumber"
                      value={formData.vatNumber}
                      onChange={handleInputChange}
                      placeholder="Enter VAT number"
                      className="text-xs"
                      required
                    />
                    <Afm2Info
                      vatNumber={formData.vatNumber}
                      onDataReceived={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select 
                    name="type" 
                    value={formData.type}
                    onValueChange={(value) => handleInputChange({ target: { name: 'type', value } })}
                    required
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(ORGANIZATION_TYPES).map((type) => (
                        <SelectItem key={type} value={type} className="text-xs">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="irsOffice">IRS Office</Label>
                  <Input
                    id="irsOffice"
                    name="irsOffice"
                    value={formData.irsOffice}
                    onChange={handleInputChange}
                    placeholder="Enter IRS office"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="erpCode">ERP Code</Label>
                  <Input
                    id="erpCode"
                    name="erpCode"
                    value={formData.erpCode}
                    onChange={handleInputChange}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="text-xs"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    name="country" 
                    value={formData.country || "Greece"}
                    onValueChange={(value) => handleInputChange({ target: { name: 'country', value } })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country} className="text-xs">
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="text-xs"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating... {uploadProgress}%</span>
                  </div>
                ) : (
                  "Add Organization"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Department Modal */}
      <Dialog open={isAddDepartmentModalOpen} onOpenChange={setIsAddDepartmentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Department to {selectedOrg?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDepartment}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="departmentName">Department Name *</Label>
                <Input
                  id="departmentName"
                  name="name"
                  value={departmentFormData.name}
                  onChange={(e) => setDepartmentFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentDescription">Description</Label>
                <Textarea
                  id="departmentDescription"
                  name="description"
                  value={departmentFormData.description}
                  onChange={(e) => setDepartmentFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="text-xs min-h-[100px]"
                  placeholder="Enter department description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDepartmentModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs">
                Add Department
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add User to {selectedOrg?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            // Handle user creation
            setIsAddUserModalOpen(false)
          }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  name="userName"
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  name="userEmail"
                  type="email"
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userRole">Role</Label>
                <Select name="userRole">
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin" className="text-xs">Administrator</SelectItem>
                    <SelectItem value="manager" className="text-xs">Manager</SelectItem>
                    <SelectItem value="user" className="text-xs">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs">
                Add User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 