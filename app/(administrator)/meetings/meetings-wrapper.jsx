"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { MeetingsList } from "./meetings-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MeetingsWrapper() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("scheduled")

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xs font-medium">Meetings Management</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                className="w-[300px] pl-8 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              size="sm" 
              className="text-xs"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </div>
        </div>
        <Tabs defaultValue="scheduled" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scheduled" className="text-xs">Scheduled</TabsTrigger>
            <TabsTrigger value="live" className="text-xs">Live</TabsTrigger>
            <TabsTrigger value="past" className="text-xs">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <MeetingsList 
          searchQuery={searchQuery} 
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
          activeTab={activeTab}
        />
      </CardContent>
    </Card>
  )
} 