"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function OrganizationCombobox({ organizations, value, onValueChange, disabled }) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const filteredOrganizations = React.useMemo(() => {
    if (!organizations) return []
    if (!searchValue) return organizations
    return organizations.filter((org) =>
      org.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [organizations, searchValue])

  const handleSelect = React.useCallback((org) => {
    console.log('Organization clicked:', org)
    onValueChange(org.value)
    setOpen(false)
    setSearchValue("")
  }, [onValueChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between cursor-pointer"
          disabled={disabled}
        >
          {value
            ? organizations.find((org) => org.value === value)?.label
            : "Select organization..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search organization..." 
            value={searchValue}
            onValueChange={(value) => {
              console.log('Search value changed:', value)
              setSearchValue(value)
            }}
          />
          <CommandEmpty>No organization found.</CommandEmpty>
          <CommandGroup>
            {filteredOrganizations.map((org) => (
              <div
                key={org.value}
                onClick={() => handleSelect(org)}
                className="flex items-center justify-between px-2 py-1.5 text-sm cursor-pointer hover:bg-black hover:text-white transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelect(org)
                  }
                }}
              >
                <span className="flex-1">{org.label}</span>
                <Check
                  className={cn(
                    "ml-2 h-4 w-4",
                    value === org.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 