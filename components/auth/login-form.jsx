"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { login } from "@/app/actions/auth"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(event) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData(event.currentTarget)
      const result = await login(formData)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result?.redirect) {
        // Force a hard navigation to ensure the middleware picks up the new cookies
        window.location.href = result.redirect
      }
    } catch (error) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gray-300" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="https://privateshare.b-cdn.net/wolf_Logo_d2511ce452.svg"
            alt="Logo"
            width={100}
            height={100}
            className="mr-2"
          />
          {process.env.NEXT_PUBLIC_BUYER_NAME}
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-gray-700">
              &ldquo;This platform has transformed how we handle our video meetings and collaborations.&rdquo;
            </p>
            <footer className="text-sm text-red-700">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to sign in to your account
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-500">
                      {error}
                    </div>
                  )}
                  <Button disabled={isLoading}>
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign In
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 