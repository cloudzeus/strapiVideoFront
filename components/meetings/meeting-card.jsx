"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Pencil, Trash2, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export function MeetingCard({ meeting, onEdit, onDelete, disabled }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting meeting:', error)
    }
  }

  const handleJoin = () => {
    router.push(`/room-meet/${meeting.id}`)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{meeting.attributes?.name}</CardTitle>
            <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(meeting.attributes?.status)}`}>
              {meeting.attributes?.status || 'scheduled'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-gray-600">{meeting.attributes?.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Start Time</p>
                <p className="text-gray-600">
                  {format(new Date(meeting.attributes?.startTime), 'PPp')}
                </p>
              </div>
              <div>
                <p className="font-medium">End Time</p>
                <p className="text-gray-600">
                  {format(new Date(meeting.attributes?.endTime), 'PPp')}
                </p>
              </div>
              <div>
                <p className="font-medium">Room</p>
                <p className="text-gray-600">{meeting.attributes?.roomName}</p>
              </div>
              <div>
                <p className="font-medium">Recurring</p>
                <p className="text-gray-600">
                  {meeting.attributes?.isRecurring ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(meeting)}
            disabled={disabled}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            size="sm"
            onClick={handleJoin}
            disabled={disabled}
          >
            <Video className="w-4 h-4 mr-2" />
            Join
          </Button>
        </CardFooter>
      </Card>

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