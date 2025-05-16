"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format } from "date-fns"
import { MeetingUsersSelector } from "@/components/meetings/meeting-users-selector"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL

export function MeetingModal({ 
  isOpen, 
  onClose, 
  mode = "add", // "add" | "edit" | "delete"
  meeting = null,
  onSuccess 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    roomName: "",
    isRecurring: false
  })

  useEffect(() => {
    if (mode === "edit" && meeting) {
      setFormData({
        name: meeting.name || "",
        description: meeting.description || "",
        startTime: format(new Date(meeting.startTime), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(meeting.endTime), "yyyy-MM-dd'T'HH:mm"),
        roomName: meeting.roomName || "",
        isRecurring: meeting.isRecurring || false
      })
    }
  }, [mode, meeting])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const url = mode === "add" 
        ? `${STRAPI_URL}/api/meetings`
        : `${STRAPI_URL}/api/meetings/${meeting.id}`

      const method = mode === "delete" ? "DELETE" : mode === "add" ? "POST" : "PUT"

      // Prepare the data with users
      const data = {
        ...formData,
        users: selectedUserIds
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: mode !== "delete" ? JSON.stringify({ data }) : undefined
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      toast.success(
        mode === "add" ? "Meeting created successfully" :
        mode === "edit" ? "Meeting updated successfully" :
        "Meeting deleted successfully"
      )

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error:", error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (mode === "delete") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Delete Meeting</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the meeting "{meeting?.name}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {mode === "add" ? "Create New Meeting" : "Edit Meeting"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Meeting Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter meeting name"
                className="text-sm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter meeting description"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="text-sm"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomName" className="text-sm font-medium">Room Name</Label>
              <Input
                id="roomName"
                value={formData.roomName}
                onChange={(e) => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
                placeholder="Enter room name"
                className="text-sm"
                required
              />
            </div>

            <MeetingUsersSelector
              meeting={meeting}
              onUsersChange={setSelectedUserIds}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (mode === "add" ? "Creating..." : "Saving...") 
                : (mode === "add" ? "Create Meeting" : "Save Changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 