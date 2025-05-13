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

export function DepartmentCombobox({ departments, value, onValueChange, disabled }) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const filteredDepartments = React.useMemo(() => {
    if (!departments) return []
    if (!searchValue) return departments
    return departments.filter((dept) =>
      dept.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [departments, searchValue])

  const handleSelect = React.useCallback((dept) => {
    console.log('Department clicked:', dept)
    onValueChange(dept.value)
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
          className="w-full justify-between cursor-pointer text-[10px]"
          disabled={disabled}
        >
          {value
            ? departments.find((dept) => dept.value === value)?.label
            : "Select department..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search department..." 
            value={searchValue}
            onValueChange={(value) => {
              console.log('Search value changed:', value)
              setSearchValue(value)
            }}
            className="text-[10px]"
          />
          <CommandEmpty className="text-[10px]">No department found.</CommandEmpty>
          <CommandGroup>
            {filteredDepartments.map((dept) => (
              <div
                key={dept.value}
                onClick={() => handleSelect(dept)}
                className="flex items-center justify-between px-2 py-1.5 text-[10px] cursor-pointer hover:bg-black hover:text-white transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelect(dept)
                  }
                }}
              >
                <span className="flex-1">{dept.label}</span>
                <Check
                  className={cn(
                    "ml-2 h-4 w-4",
                    value === dept.value ? "opacity-100" : "opacity-0"
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