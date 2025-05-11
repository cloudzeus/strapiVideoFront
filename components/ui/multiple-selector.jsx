"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function MultipleSelector({
  value = [],
  onChange,
  placeholder,
  defaultOptions = [],
  className,
  badgeClassName,
  onSelect,
  onUnselect,
}) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(value)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    setSelected(value)
  }, [value])

  const handleSelect = async (option) => {
    if (onSelect) {
      await onSelect(option)
    } else {
      const newSelected = [...selected, option]
      setSelected(newSelected)
      onChange?.(newSelected)
    }
    setSearchTerm("")
  }

  const handleUnselect = async (option) => {
    if (onUnselect) {
      await onUnselect(option)
    } else {
      const newSelected = selected.filter((item) => item.value !== option.value)
      setSelected(newSelected)
      onChange?.(newSelected)
    }
  }

  const filteredOptions = defaultOptions.filter(
    (option) => 
      !selected.find((item) => item.value === option.value) &&
      (option.searchText || option.label.toLowerCase()).includes(searchTerm.toLowerCase())
  )

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        {open && (
          <div className="absolute top-full z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="max-h-[200px] overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm">No results found.</div>
              ) : (
                <div>
                  {filteredOptions.map((option) => (
                    <div
                      key={`option-${option.value}`}
                      onClick={() => handleSelect(option)}
                      className="cursor-pointer px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <TooltipProvider>
            {selected.map((option) => (
              <Tooltip key={`tooltip-${option.value}`}>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "bg-black text-white hover:bg-black/90",
                      badgeClassName
                    )}
                  >
                    <span className="text-[9px]">{option.email}</span>
                    <button
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={() => handleUnselect(option)}
                    >
                      <X className="h-3 w-3 text-white hover:text-white/80" />
                    </button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {option.label}
                    {option.department && <span><br />Department: {option.department}</span>}
                    {option.role && <span><br />Role: {option.role}</span>}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}
    </div>
  )
} 