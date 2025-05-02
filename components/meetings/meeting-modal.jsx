"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { MultipleSelector } from "@/components/ui/multiple-selector"

export function MeetingModal({ 
  open, 
  onOpenChange, 
  meeting, 
  onSave,
  users = [] // Array of users for the multiple selector
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
    participants: []
  })

  useEffect(() => {
    if (meeting) {
      setFormData({
        name: meeting.name,
        description: meeting.description,
        startTime: new Date(meeting.startTime),
        endTime: new Date(meeting.endTime),
        participants: meeting.participants || []
      })
    }
  }, [meeting])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const userOptions = users.map(user => ({
    value: user.id,
    label: user.username,
    email: user.email
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{meeting ? "Edit Meeting" : "Add New Meeting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Meeting Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startTime ? (
                      format(formData.startTime, "PPP HH:mm")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startTime}
                    onSelect={(date) => setFormData({ ...formData, startTime: date })}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={format(formData.startTime, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":")
                        const newDate = new Date(formData.startTime)
                        newDate.setHours(parseInt(hours), parseInt(minutes))
                        setFormData({ ...formData, startTime: newDate })
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endTime ? (
                      format(formData.endTime, "PPP HH:mm")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endTime}
                    onSelect={(date) => setFormData({ ...formData, endTime: date })}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={format(formData.endTime, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":")
                        const newDate = new Date(formData.endTime)
                        newDate.setHours(parseInt(hours), parseInt(minutes))
                        setFormData({ ...formData, endTime: newDate })
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Participants</Label>
            <MultipleSelector
              value={formData.participants}
              onChange={(selected) => setFormData({ ...formData, participants: selected })}
              defaultOptions={userOptions}
              placeholder="Select participants..."
              emptyIndicator={
                <p className="text-center text-sm text-muted-foreground">
                  No users found.
                </p>
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {meeting ? "Save Changes" : "Create Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 