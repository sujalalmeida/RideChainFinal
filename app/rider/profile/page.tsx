"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RiderLayout } from "@/components/layouts/rider-layout"
import { Camera, Check, Edit, Leaf, Star, User } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function RiderProfilePage() {
  const { user, setUser } = useAppContext()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    preferGreenRides: user?.preferences?.preferGreenRides || false,
    carpoolEnabled: user?.preferences?.carpoolEnabled || false,
  })
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (user) {
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferences: {
          ...user.preferences,
          preferGreenRides: formData.preferGreenRides,
          carpoolEnabled: formData.carpoolEnabled,
        },
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      setIsEditing(false)
    }
  }

  useEffect(() => {
    if (!user) {
      // Redirect to login if no user is found
      router.push("/auth/login")
    } else {
      setIsLoading(false)
    }
  }, [user, router])

  if (isLoading) {
    return (
      <RiderLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </RiderLayout>
    )
  }

  return (
    <RiderLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-1">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Personal Information</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </div>
                  <CardDescription>
                    {isEditing ? "Edit your personal details" : "Your personal details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {isEditing ? (
                          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                        ) : (
                          <div className="p-2 border rounded-md bg-gray-50">{user.name}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          <div className="p-2 border rounded-md bg-gray-50">{user.email}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        {isEditing ? (
                          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                        ) : (
                          <div className="p-2 border rounded-md bg-gray-50">{user.phone}</div>
                        )}
                      </div>

                      {isEditing && (
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">
                          Save Changes
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Your profile picture is visible to drivers and other users</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <Button variant="outline" className="gap-2">
                    <Camera className="h-4 w-4" /> Change Photo
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Details about your RideChain account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Account Type</p>
                      <p className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-600" />
                        Rider
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">April 2025</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Rides</p>
                      <p className="font-medium">{user.totalRides}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-medium flex items-center gap-1">
                        {user.rating || "N/A"}
                        {user.rating && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Ride Preferences</CardTitle>
                <CardDescription>Customize your ride experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Ride Options</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="green-rides">Prefer Green Rides</Label>
                      <p className="text-sm text-muted-foreground">Prioritize electric and hybrid vehicles</p>
                    </div>
                    <Switch
                      id="green-rides"
                      checked={formData.preferGreenRides}
                      onCheckedChange={(checked) => handleSwitchChange("preferGreenRides", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="carpool">Enable Carpooling</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow sharing rides with other passengers going your way
                      </p>
                    </div>
                    <Switch
                      id="carpool"
                      checked={formData.carpoolEnabled}
                      onCheckedChange={(checked) => handleSwitchChange("carpoolEnabled", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Safety Preferences</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="share-trip">Share Trip Status</Label>
                      <p className="text-sm text-muted-foreground">Share your trip status with trusted contacts</p>
                    </div>
                    <Switch id="share-trip" defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="record-audio">Record Audio</Label>
                      <p className="text-sm text-muted-foreground">Record audio during rides for safety</p>
                    </div>
                    <Switch id="record-audio" />
                  </div>
                </div>

                {formData.preferGreenRides && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Green Rider Status</h4>
                        <p className="text-sm text-green-700 mt-1">
                          You've saved {user.carbonSaved?.toFixed(2) || "0.00"} kg of CO2 by choosing green rides!
                        </p>
                        {(user.carbonSaved || 0) > 5 && (
                          <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
                            Eco-Friendly Rider
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit}>
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Your Ratings & Reviews</CardTitle>
                <CardDescription>See how drivers have rated you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="flex flex-col items-center">
                      <div className="text-5xl font-bold text-indigo-600">{user.rating || "N/A"}</div>
                      <div className="flex mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= (user.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Based on {user.totalRides} rides</p>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">5</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="w-full max-w-md mx-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "70%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">70%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">4</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="w-full max-w-md mx-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "20%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">20%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">3</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="w-full max-w-md mx-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "7%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">7%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">2</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="w-full max-w-md mx-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "2%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">2%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">1</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="w-full max-w-md mx-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "1%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">1%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Reviews</h3>

                    {user.totalRides > 0 ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>MT</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">Michael T.</span>
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= 5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 text-sm">Great passenger! Very punctual and friendly.</p>
                          <p className="text-xs text-muted-foreground mt-1">April 2, 2025</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>JD</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">John D.</span>
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 text-sm">Pleasant ride, would pick up again.</p>
                          <p className="text-xs text-muted-foreground mt-1">March 28, 2025</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          You haven't received any reviews yet. Complete rides to get reviews from drivers.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RiderLayout>
  )
}

