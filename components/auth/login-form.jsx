"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { login } from "@/app/actions/auth"
import { useRouter } from "next/navigation"
import { Lock, Mail } from "lucide-react"
import Image from "next/image"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 transition-all duration-200" 
      disabled={pending}
    >
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  )
}

export function LoginForm() {
  const [error, setError] = useState(null)
  const router = useRouter()

  async function handleSubmit(formData) {
    try {
      setError(null)
      const result = await login(formData)
      
      if (result?.success && result?.redirect) {
        router.push(result.redirect)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message)
      toast.error(error.message || "Failed to sign in")
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url("https://privateshare.b-cdn.net/Communication.svg")',
        backgroundColor: 'rgb(249, 250, 251)',
        backgroundBlendMode: 'normal'
      }}
    >
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="https://privateshare.b-cdn.net/wolf_Logo_d2511ce452.svg"
              alt="Logo"
              width={50}
              height={50}
              priority
            />
          </div>
          <h1 className="text-lg font-light text-gray-900 mb-2">
            ADVANCED VIDEO CONFERENCE MANAGEMENT
          </h1>
          <p className="text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="pl-10 w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 w-full rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="pt-4">
            <SubmitButton />
          </div>
        </form>
        <div className="text-sm text-gray-600">Licensed to {process.env.NEXT_PUBLIC_BUYER_NAME}</div>
      </div>
    </div>
  )
} 