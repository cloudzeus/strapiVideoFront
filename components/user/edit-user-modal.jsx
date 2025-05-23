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
import { OrganizationCombobox } from "@/components/organization/organization-combobox"
import { DepartmentCombobox } from "@/components/department/department-combobox"

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
  role: z.string().min(1, "Role is required"),
  confirmed: z.boolean().default(true),
  blocked: z.boolean().default(false),
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
      role: user?.role?.id?.toString() || "",
      confirmed: user?.confirmed ?? true,
      blocked: user?.blocked ?? false,
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

  // Fetch roles
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users-permissions/roles`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      const data = await response.json()
      return data.roles || []
    },
  })

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
      // If there's a new avatar, upload it first
      let avatarId = null
      if (avatar) {
        const formDataAvatar = new FormData()
        formDataAvatar.append('files', avatar)
        
        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
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

      // Create the user
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            email: values.email,
            username: values.email, // Strapi requires a username
            password: values.password,
            name: values.name,
            lastName: values.lastName,
            jobPosition: values.jobPosition,
            phone: values.phone,
            workPhone: values.workPhone,
            mobilePhone: values.mobile,
            address: values.address,
            city: values.city,
            zip: values.zip,
            country: values.country,
            role: values.role,
            department: values.department,
            organization: values.organization,
            confirmed: values.confirmed,
            blocked: values.blocked,
            avatar: avatarId,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to save user')
      }

      toast.success("User created successfully")
      onSave()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error(error.message || "Failed to save user")
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
                      <OrganizationCombobox
                        organizations={organizationOptions}
                        value={field.value}
                        onValueChange={(value) => {
                          console.log('Organization selected:', value) // Debug log
                          field.onChange(value)
                          setSelectedOrgId(value)
                          // Reset department when organization changes
                          form.setValue('department', '')
                        }}
                        disabled={isSubmitting}
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
                    <FormControl>
                      <DepartmentCombobox
                        departments={departments.map(dept => ({
                          value: dept.id.toString(),
                          label: dept.attributes?.name || dept.name || 'Unnamed Department'
                        }))}
                        value={field.value}
                        onValueChange={(value) => {
                          console.log('Department selected:', value) // Debug log
                          field.onChange(value)
                        }}
                        disabled={isSubmitting || !selectedOrgId}
                      />
                    </FormControl>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="confirmed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="text-xs">Confirmed</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blocked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="text-xs">Blocked</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
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