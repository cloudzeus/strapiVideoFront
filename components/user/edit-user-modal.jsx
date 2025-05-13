"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDropzone } from "react-dropzone"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FiUpload } from "react-icons/fi"
import { toast } from "sonner"
import { Combobox } from "@/components/ui/combobox"
import React from "react"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  jobPosition: z.string().optional(),
  phone: z.string().optional(),
  workPhone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  avatar: z.any().optional(),
})

export function EditUserModal({ user, onSave, open, onOpenChange }) {
  const [avatar, setAvatar] = useState(null)
  const [preview, setPreview] = useState(user?.avatar?.url || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState(user?.organization?.id || "")
  const [departments, setDepartments] = useState([])

  const isEditMode = !!user

  console.log('EditModal - User Data:', user)
  console.log('EditModal - Avatar Preview:', {
    avatarData: user?.avatar,
    previewUrl: preview
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      password: "",
      organization: user?.organization?.id || "",
      department: user?.department?.id || "",
      jobPosition: user?.jobPosition || "",
      phone: user?.phone || "",
      workPhone: user?.workPhone || "",
      mobile: user?.mobile || "",
      address: user?.address || "",
      city: user?.city || "",
      country: user?.country || "Greece",
      zip: user?.zip || "",
    },
  })

  // Fetch organizations with their departments
  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations?populate=departments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      const data = await response.json()
      console.log('Organizations response:', data) // Debug log
      return data.data || []
    },
  })

  // Transform organizations data for Combobox
  const organizationOptions = React.useMemo(() => {
    if (!organizations) return []
    return organizations.map(org => {
      console.log('Organization data:', org) // Debug log
      return {
        value: org.id.toString(),
        label: org.attributes?.name || org.name || 'Unnamed Organization'
      }
    })
  }, [organizations])

  // Update departments when organization changes
  useEffect(() => {
    if (selectedOrgId && organizations) {
      const selectedOrg = organizations.find(org => org.id.toString() === selectedOrgId)
      if (selectedOrg) {
        const deptData = selectedOrg.attributes?.departments?.data || selectedOrg.departments || []
        setDepartments(Array.isArray(deptData) ? deptData : [])
      } else {
        setDepartments([])
      }
    } else {
      setDepartments([])
    }
  }, [selectedOrgId, organizations])

  // List of countries
  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
    "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
    "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman",
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
    "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ]

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      setAvatar(file)
      setPreview(URL.createObjectURL(file))
    },
  })

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  async function onSubmit(values) {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      let avatarData = null

      if (avatar) {
        try {
          const formData = new FormData()
          formData.append("files", avatar)
          if (isEditMode) {
            formData.append("ref", "plugin::users-permissions.user")
            formData.append("refId", user.id)
          }
          formData.append("field", "avatar")

          const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          })
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text()
            console.error('Upload error response:', errorText)
            throw new Error("Failed to upload avatar")
          }
          
          const uploadData = await uploadResponse.json()
          if (!Array.isArray(uploadData) || uploadData.length === 0) {
            throw new Error("Invalid upload response")
          }
          avatarData = uploadData[0]
          // Update preview with the new avatar URL
          setPreview(avatarData.url || null)
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError)
          toast.error("Failed to upload avatar. Please try again.")
          return
        }
      }

      // Prepare data for Strapi
      const dataToSubmit = {
        username: values.email,
        email: values.email,
        name: values.name,
        lastName: values.lastName,
        phone: values.phone || null,
        workPhone: values.workPhone || null,
        mobile: values.mobile || null,
        address: values.address || null,
        city: values.city || null,
        country: values.country || null,
        zip: values.zip || null,
        jobPosition: values.jobPosition || null,
        password: values.password, // Always include password for new users
      }

      // Add avatar data if it exists
      if (avatarData) {
        dataToSubmit.avatar = avatarData.id
      }

      // Only include organization and department if they're provided
      if (values.organization) {
        dataToSubmit.organization = values.organization
      }
      if (values.department) {
        dataToSubmit.department = values.department
      }

      try {
        const url = isEditMode 
          ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users-permissions/users/${user.id}`
          : `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users-permissions/users`
        
        const response = await fetch(url, {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(dataToSubmit),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Update error response:', errorText)
          throw new Error("Failed to save user")
        }

        const responseData = await response.json()
        if (!responseData) {
          throw new Error("Invalid response from server")
        }

        toast.success(isEditMode ? "User updated successfully" : "User created successfully")
        onSave()
        onOpenChange(false)
      } catch (error) {
        console.error('User save error:', error)
        toast.error(error.message || "Failed to save user. Please try again.")
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      toast.error(error.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center">
              <div {...getRootProps()} className="cursor-pointer flex flex-col items-center">
                <input {...getInputProps()} />
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={preview} 
                    alt="User avatar"
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <FiUpload className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Drag & drop or click to upload avatar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Password (leave blank to keep current)</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Organization</FormLabel>
                    <FormControl>
                      <Combobox
                        options={organizationOptions}
                        value={field.value?.toString()}
                        onValueChange={(value) => {
                          console.log('Selected organization value:', value) // Debug log
                          field.onChange(value)
                          setSelectedOrgId(value)
                        }}
                        placeholder="Select organization"
                        emptyMessage="No organizations found."
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Department</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value?.toString()}
                      disabled={!selectedOrgId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedOrgId ? "Select department" : "Select organization first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.attributes?.name || dept.name || 'Unnamed Department'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Job Position</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter job position" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Work Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Mobile</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 