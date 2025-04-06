"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Car } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppContext } from "@/contexts/app-context"
import type { UserRole } from "@/contexts/app-context"

export default function LoginPage() {
  const { login, loading } = useAppContext()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    autoLogin: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent, role: UserRole) => {
    e.preventDefault()

    if (formData.autoLogin) {
      // Auto-login for demo purposes
      await login(formData.email || "demo@example.com", "password", role)
    } else {
      // Normal login flow
      if (formData.email && formData.password) {
        await login(formData.email, formData.password, role)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="flex items-center gap-2 mb-8">
        <Car className="h-6 w-6 text-indigo-600" />
        <span className="text-2xl font-bold">RideChain</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
        </CardHeader>

        <Tabs defaultValue="rider" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rider">Rider</TabsTrigger>
            <TabsTrigger value="driver">Driver</TabsTrigger>
          </TabsList>

          <TabsContent value="rider">
            <form onSubmit={(e) => handleSubmit(e, "rider")}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rider-email">Email</Label>
                  <Input
                    id="rider-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rider-password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-xs text-indigo-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="rider-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rider-remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleCheckboxChange("rememberMe", checked as boolean)}
                  />
                  <label
                    htmlFor="rider-remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rider-auto-login"
                    checked={formData.autoLogin}
                    onCheckedChange={(checked) => handleCheckboxChange("autoLogin", checked as boolean)}
                  />
                  <label
                    htmlFor="rider-auto-login"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Auto-login (Demo Mode)
                  </label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In as Rider"}
                </Button>
                <p className="mt-4 text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link href="/auth/register?role=rider" className="text-indigo-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="driver">
            <form onSubmit={(e) => handleSubmit(e, "driver")}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driver-email">Email</Label>
                  <Input
                    id="driver-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="driver-password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-xs text-indigo-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="driver-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="driver-remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleCheckboxChange("rememberMe", checked as boolean)}
                  />
                  <label
                    htmlFor="driver-remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="driver-auto-login"
                    checked={formData.autoLogin}
                    onCheckedChange={(checked) => handleCheckboxChange("autoLogin", checked as boolean)}
                  />
                  <label
                    htmlFor="driver-auto-login"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Auto-login (Demo Mode)
                  </label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In as Driver"}
                </Button>
                <p className="mt-4 text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link href="/auth/register?role=driver" className="text-indigo-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

