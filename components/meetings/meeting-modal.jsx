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

export function MeetingModal({ 
  open, 
  onOpenChange, 
  meeting, 
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
    roomName: "",
    isRecurring: false,
    users: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (meeting) {
      // Safely parse dates
      const startTime = meeting.attributes?.startTime ? 
        new Date(meeting.attributes.startTime) : new Date()
      const endTime = meeting.attributes?.endTime ? 
        new Date(meeting.attributes.endTime) : new Date()

      // Get users data in the correct format
      const users = meeting.attributes?.users?.data?.map(user => user.id) || 
                   meeting.users?.data?.map(user => user.id) ||
                   meeting.users?.map(user => user.id) || []

      setFormData({
        name: meeting.attributes?.name || meeting.name || "",
        description: meeting.attributes?.description || meeting.description || "",
        startTime: startTime,
        endTime: endTime,
        roomName: meeting.attributes?.roomName || meeting.roomName || "",
        isRecurring: meeting.attributes?.isRecurring || meeting.isRecurring || false,
        users: users
      })
    } else {
      // Reset form for new meeting
      setFormData({
        name: "",
        description: "",
        startTime: new Date(),
        endTime: new Date(),
        roomName: "",
        isRecurring: false,
        users: []
      })
    }
  }, [meeting])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name || !formData.startTime || !formData.endTime) {
        throw new Error('Please fill in all required fields')
      }

      // Create meeting data object
      const meetingData = {
        data: {
          name: formData.name,
          description: formData.description,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
          roomName: formData.roomName || `meeting-${Date.now()}`,
          isRecurring: formData.isRecurring,
          jitsiStatus: 'scheduled',
          users: formData.users.map(id => parseInt(id))
        }
      }

      console.log('Sending meeting data:', JSON.stringify(meetingData, null, 2))

      // Use the server-side route for updates
      const response = await fetch(`/api/meetings${meeting?.id ? `/${meeting.id}` : ''}`, {
        method: meeting?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          data: responseData
        })
        throw new Error(responseData.error || `Failed to save meeting: ${response.status}`)
      }

      if (!responseData.data) {
        throw new Error('Invalid response format from server')
      }

      console.log('Meeting saved successfully:', responseData)

      // Pass the full response data to the parent component
      onSave(responseData)
      onOpenChange(false)
      toast.success("Meeting saved successfully")
    } catch (error) {
      console.error('Error saving meeting:', error)
      setError(error.message)
      toast.error(error.message || 'Failed to save meeting')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (date, field) => {
    setFormData(prev => {
      const newData = { ...prev }
      if (field === 'startTime') {
        newData.startTime = date
        // If end time is before start time, update it
        if (newData.endTime < date) {
          newData.endTime = new Date(date.getTime() + 60 * 60 * 1000) // Add 1 hour
        }
      } else {
        newData.endTime = date
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{meeting?.id ? "Edit Meeting" : "Add New Meeting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Meeting Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={isLoading}
              placeholder="Enter meeting name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              disabled={isLoading}
              placeholder="Enter meeting description"
            />
          </div>

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
                  disabled={isLoading}
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
                  onSelect={(date) => handleDateChange(date, 'startTime')}
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
                      handleDateChange(newDate, 'startTime')
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
                  disabled={isLoading}
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
                  onSelect={(date) => handleDateChange(date, 'endTime')}
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
                      handleDateChange(newDate, 'endTime')
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
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
            disabled={isLoading}
          />

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.startTime || !formData.endTime}
            >
              {isLoading ? "Saving..." : meeting?.id ? "Save Changes" : "Create Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 