"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  organization: z.string().min(1, "Please select an organization"),
})

export function AddDepartmentModal({ open, onOpenChange, onSave }) {
  const [selectedOrg, setSelectedOrg] = React.useState("")
  const [openCombobox, setOpenCombobox] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      organization: "",
    },
  })

  // Fetch organizations
  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/organizations`,
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

  // Helper function to get organization name
  const getOrgName = (org) => {
    if (!org) return ""
    return org.attributes?.name || org.name || ""
  }

  // Filter organizations based on search query
  const filteredOrganizations = React.useMemo(() => {
    if (!organizations) return []
    if (!searchQuery) return organizations

    const query = searchQuery.toLowerCase()
    return organizations.filter((org) => {
      const name = getOrgName(org).toLowerCase()
      return name.includes(query)
    })
  }, [organizations, searchQuery])

  const onSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/departments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              name: values.name,
              description: values.description,
              organization: values.organization,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to create department: ${response.status}`)
      }

      form.reset()
      onSave?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating department:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xs">Add Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs">Organization</FormLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className={cn(
                            "w-full justify-between text-[10px]",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? getOrgName(organizations?.find(
                                (org) => org.id.toString() === field.value
                              ))
                            : "Select organization..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search organization..."
                          className="h-9 text-[10px]"
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty className="text-[10px]">
                            No organization found.
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredOrganizations.map((org) => (
                              <CommandItem
                                key={org.id}
                                value={org.id.toString()}
                                onSelect={(value) => {
                                  form.setValue("organization", value)
                                  setSelectedOrg(value)
                                  setOpenCombobox(false)
                                  setSearchQuery("")
                                }}
                                className="text-[10px]"
                              >
                                {getOrgName(org)}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    field.value === org.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Department Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter department name"
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter department description"
                      className="text-xs min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs">
                Add Department
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 