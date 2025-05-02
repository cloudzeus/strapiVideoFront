import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, isValid } from "date-fns"
import { Pencil, Eye, UserPlus, Trash2, Video, Clock, Calendar } from "lucide-react"

export function MeetingCard({ meeting, onEdit, onView, onAddParticipant, onDelete, onJoin }) {
  const getStatusColor = (startTime, endTime) => {
    try {
      const now = new Date()
      const start = new Date(startTime)
      const end = new Date(endTime)

      if (!isValid(start) || !isValid(end)) return "bg-gray-100 text-gray-800"
      if (now < start) return "bg-blue-100 text-blue-800"
      if (now >= start && now <= end) return "bg-green-100 text-green-800"
      return "bg-gray-100 text-gray-800"
    } catch (error) {
      console.error('Error calculating status color:', error)
      return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (startTime, endTime) => {
    try {
      const now = new Date()
      const start = new Date(startTime)
      const end = new Date(endTime)

      if (!isValid(start) || !isValid(end)) return "Invalid Date"
      if (now < start) return "Scheduled"
      if (now >= start && now <= end) return "Active"
      return "Completed"
    } catch (error) {
      console.error('Error calculating status text:', error)
      return "Invalid Date"
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      if (!isValid(date)) return "Invalid Date"
      return format(date, "PPP HH:mm")
    } catch (error) {
      console.error('Error formatting date:', error)
      return "Invalid Date"
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[11px] font-bold line-clamp-1">{meeting.name || 'Untitled Meeting'}</h3>
          <Badge className={getStatusColor(meeting.startTime, meeting.endTime)}>
            {getStatusText(meeting.startTime, meeting.endTime)}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3 line-clamp-2">
          {meeting.description || 'No description provided'}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-bold">{formatDate(meeting.startTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-bold">{formatDate(meeting.endTime)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
        >
          <Pencil className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onView}
          className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
        >
          <Eye className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddParticipant}
          className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
        >
          <UserPlus className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
        >
          <Trash2 className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onJoin}
          className="h-7 w-7 rounded-[8px] bg-gray-900 hover:bg-orange-500 group"
        >
          <Video className="h-3 w-3 text-orange-500 group-hover:text-gray-900" />
        </Button>
      </CardFooter>
    </Card>
  )
} 