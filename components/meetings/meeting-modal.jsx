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
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { MeetingUsersSelector } from "./meeting-users-selector"
import { useRouter } from "next/navigation"

export function MeetingModal({ 
  open, 
  onOpenChange, 
  meeting, 
  onSave,
  session
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    roomName: "",
    isRecurring: false,
    users: []
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (meeting) {
      setFormData({
        name: meeting.attributes?.name || meeting.name || "",
        description: meeting.attributes?.description || meeting.description || "",
        startTime: meeting.attributes?.startTime || meeting.startTime || "",
        endTime: meeting.attributes?.endTime || meeting.endTime || "",
        roomName: meeting.attributes?.roomName || meeting.roomName || "",
        isRecurring: meeting.attributes?.isRecurring || meeting.isRecurring || false,
        users: meeting.attributes?.users?.data?.map(user => user.id) || 
               meeting.users?.data?.map(user => user.id) ||
               meeting.users?.map(user => user.id) || []
      })
    } else {
      setFormData({
        name: "",
        description: "",
        startTime: "",
        endTime: "",
        roomName: "",
        isRecurring: false,
        users: []
      })
    }
  }, [meeting])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.startTime || !formData.endTime) {
        throw new Error('Please fill in all required fields')
      }

      // Validate dates
      const startTime = new Date(formData.startTime)
      const endTime = new Date(formData.endTime)
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error('Invalid date format')
      }

      if (endTime <= startTime) {
        throw new Error('End time must be after start time')
      }

      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message || "Failed to save meeting")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (date, field) => {
    setFormData(prev => {
      const newData = { ...prev }
      if (field === 'startTime') {
        newData.startTime = date.toISOString()
        // If end time is before start time, update it
        if (newData.endTime && newData.endTime < date) {
          newData.endTime = new Date(date.getTime() + 60 * 60 * 1000) // Add 1 hour
        }
      } else {
        newData.endTime = date.toISOString()
      }
      return newData
    })
  }

  const handleUsersChange = (userIds) => {
    setFormData(prev => ({
      ...prev,
      users: userIds
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{meeting ? "Edit Meeting" : "Create Meeting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Meeting Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              value={formData.roomName}
              onChange={(e) => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
              placeholder="Enter room name"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
            />
            <Label htmlFor="isRecurring">Recurring Meeting</Label>
          </div>

          <MeetingUsersSelector
            meeting={meeting}
            onUsersChange={handleUsersChange}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : meeting ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 