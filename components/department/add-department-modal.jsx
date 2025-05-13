"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { toast } from "sonner"
import { OrganizationCombobox } from "@/components/organization/organization-combobox"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  organization: z.string().min(1, "Please select an organization"),
})

export function AddDepartmentModal({ open, onOpenChange, onSave }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      organization: "",
    },
  })

  // Fetch organizations
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
      return data.data || []
    },
  })

  // Transform organizations data for Combobox
  const organizationOptions = React.useMemo(() => {
    if (!organizations) return []
    return organizations.map(org => ({
      value: org.id.toString(),
      label: org.attributes?.name || org.name || 'Unnamed Organization'
    }))
  }, [organizations])

  async function onSubmit(values) {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/departments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            data: {
              name: values.name,
              organization: values.organization,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to create department")
      }

      toast.success("Department created successfully")
      onSave()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error creating department:", error)
      toast.error(error.message || "Failed to create department")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xs">Add New Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs">Organization</FormLabel>
                  <FormControl>
                    <OrganizationCombobox
                      organizations={organizationOptions}
                      value={field.value}
                      onValueChange={(value) => {
                        console.log('Organization selected:', value)
                        field.onChange(value)
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
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-xs">Department Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-xs w-full" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs"
              >
                {isSubmitting ? "Creating..." : "Create Department"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 