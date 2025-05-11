"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MeetingModal } from "./meeting-modal"
import { toast } from "sonner"
import { Pencil, Trash2, Video, User, Calendar, Users } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export function MeetingCard({ meeting, onDelete, onUpdate }) {
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500'
      case 'in_progress':
        return 'bg-green-500'
      case 'completed':
        return 'bg-gray-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete(meeting.id)
      toast.success("Meeting deleted successfully")
    } catch (error) {
      console.error('Error deleting meeting:', error)
      toast.error("Failed to delete meeting")
    }
  }

  const handleJoin = () => {
    router.push(`/room-meet/${meeting.id}`)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">
              {meeting.attributes?.name || meeting.name}
            </CardTitle>
            <Badge className={getStatusColor(meeting.attributes?.jitsiStatus || meeting.jitsiStatus)}>
              {meeting.attributes?.jitsiStatus || meeting.jitsiStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            {meeting.attributes?.description || meeting.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {format(new Date(meeting.attributes?.startTime || meeting.startTime), "PPP HH:mm")} -{" "}
                {format(new Date(meeting.attributes?.endTime || meeting.endTime), "HH:mm")}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {(meeting.attributes?.users?.data?.length || meeting.users?.length || 0)} Participants
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              className="bg-orange-500 text-black hover:bg-orange-600 hover:text-white"
              size="icon"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              className="bg-orange-500 text-black hover:bg-orange-600 hover:text-white"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleJoin}>
            <Video className="h-4 w-4 mr-2" />
            Join Meeting
          </Button>
        </CardFooter>
      </Card>

      <MeetingModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        meeting={meeting}
        onSave={onUpdate}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the meeting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 