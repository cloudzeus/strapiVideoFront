"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"
import { OrganizationsList } from "./organizations-list"

export function OrganizationsWrapper() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xs font-medium">Organizations Management</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
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
              <Building2 className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <OrganizationsList 
          searchQuery={searchQuery} 
          isAddModalOpen={isAddModalOpen}
          setIsAddModalOpen={setIsAddModalOpen}
        />
      </CardContent>
    </Card>
  )
} 