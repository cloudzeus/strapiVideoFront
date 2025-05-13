"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { EditUserModal } from "@/components/user/edit-user-modal"
import { LicenseModal } from "@/components/license/license-modal"

export function AdminHeader({ user }) {
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false)

  console.log('AdminHeader - User Data:', user)
  console.log('AdminHeader - Avatar Data:', user?.avatar)

  const handleLogout = async () => {
    await logout()
  }

  const handleEditProfile = (e) => {
    e.preventDefault()
    setIsEditModalOpen(true)
  }

  const handleLicense = (e) => {
    e.preventDefault()
    setIsLicenseModalOpen(true)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <img
            src="https://privateshare.b-cdn.net/wolf_Logo_d2511ce452.svg"
            alt="Logo"
            className="h-8 w-auto"
          />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm font-medium">VIDEO MANAGER</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 bg-black text-white">
                  <AvatarImage 
                    src={user?.avatar?.url || null}
                    alt={user?.username}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-black text-white">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {user?.jobPosition && (
                    <span className="inline-flex items-center bg-black text-white text-[10px] px-2 py-0.5 rounded-full w-fit">
                      {user.jobPosition}
                    </span>
                  )}
                  {user?.organization && (
                    <p className="text-[10px] font-bold leading-none">
                      {user.organization}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleEditProfile}>
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLicense}>
                License
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EditUserModal 
            user={user} 
            onSave={() => router.refresh()} 
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
          />
          <LicenseModal
            open={isLicenseModalOpen}
            onOpenChange={setIsLicenseModalOpen}
          />
        </div>
      </div>
    </header>
  )
} 