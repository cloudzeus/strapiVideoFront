"use client"

import * as React from "react"
import { Command as CommandPrimitive, useCommandState } from "cmdk"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function MultipleSelector({
  value = [],
  onChange,
  placeholder,
  defaultOptions = [],
  options,
  delay,
  onSearch,
  onSearchSync,
  loadingIndicator,
  emptyIndicator,
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  hidePlaceholderWhenSelected,
  disabled,
  groupBy,
  className,
  badgeClassName,
  selectFirstItem = true,
  creatable = false,
  triggerSearchOnFocus = false,
  commandProps,
  inputProps,
  hideClearAllButton = false,
}) {
  const inputRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [selected, setSelected] = React.useState(value)
  const [availableOptions, setAvailableOptions] = React.useState(defaultOptions)
  const debouncedSearchTerm = useDebounce(inputValue, delay)

  React.useEffect(() => {
    if (value) {
      setSelected(value)
    }
  }, [value])

  const handleUnselect = React.useCallback(
    (option) => {
      const newOptions = selected.filter((s) => s.value !== option.value)
      setSelected(newOptions)
      onChange?.(newOptions)
    },
    [onChange, selected]
  )

  const handleKeyDown = React.useCallback(
    (e) => {
      const input = inputRef.current
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "" && selected.length > 0) {
            const lastSelectOption = selected[selected.length - 1]
            if (!lastSelectOption.fixed) {
              handleUnselect(selected[selected.length - 1])
            }
          }
        }
        if (e.key === "Escape") {
          input.blur()
        }
      }
    },
    [handleUnselect, selected]
  )

  const selectables = React.useMemo(() => {
    return availableOptions.filter((option) => !selected.find((s) => s.value === option.value))
  }, [availableOptions, selected])

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent", className)}
      {...commandProps}
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className={cn(
                "hover:bg-secondary/80",
                badgeClassName
              )}
            >
              {option.label}
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(option)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(option)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={hidePlaceholderWhenSelected && selected.length > 0 ? "" : placeholder}
            disabled={disabled}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
            {...inputProps}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList className="h-full overflow-auto">
              {selectables.length === 0 ? (
                <div className="py-6 text-center text-sm">
                  {emptyIndicator || "No results found."}
                </div>
              ) : (
                <CommandGroup className="h-full overflow-auto">
                  {selectables.map((option) => (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onSelect={() => {
                        if (selected.length >= maxSelected) {
                          onMaxSelected?.(selected.length)
                          return
                        }
                        setInputValue("")
                        const newOptions = [...selected, option]
                        setSelected(newOptions)
                        onChange?.(newOptions)
                      }}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        )}
      </div>
    </Command>
  )
} 