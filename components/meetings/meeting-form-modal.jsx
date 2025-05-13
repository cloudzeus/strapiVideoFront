"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function MeetingFormModal({ open, onOpenChange, meeting, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  })

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.attributes.title || "",
        description: meeting.attributes.description || "",
        startTime: meeting.attributes.startTime || "",
        endTime: meeting.attributes.endTime || "",
      })
    } else {
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
      })
    }
  }, [meeting])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const url = meeting
        ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/meetings/${meeting.id}`
        : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/meetings`

      const response = await fetch(url, {
        method: meeting ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            ...formData,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save meeting")
      }

      const data = await response.json()
      onSave(data.data)
      onOpenChange(false)
      toast.success(meeting ? "Meeting updated successfully" : "Meeting created successfully")
    } catch (error) {
      console.error("Error saving meeting:", error)
      toast.error(error.message || "Failed to save meeting")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{meeting ? "Edit Meeting" : "Create New Meeting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="startTime" className="text-sm font-medium">
              Start Time
            </label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endTime" className="text-sm font-medium">
              End Time
            </label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {meeting ? "Update Meeting" : "Create Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 