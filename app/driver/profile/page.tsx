"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DriverLayout } from "@/components/layouts/driver-layout"
import { Camera, Car, Check, Edit, Shield, Star } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function DriverProfilePage() {
  const { user, setUser } = useAppContext()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    carModel: "Toyota Camry",
    carColor: "Silver",
    carPlate: "ABC 123",
    isGreenCar: false,
  })

  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

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
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      setIsEditing(false)
    }
  }

  if (!user) {
    return (
      <DriverLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DriverLayout>
    )
  }

  return (
    <DriverLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and driver details</p>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="vehicle">Vehicle Details</TabsTrigger>
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
                  <CardDescription>Your profile picture is visible to riders</CardDescription>
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
                  <CardDescription>Details about your RideChain driver account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Account Type</p>
                      <p className="font-medium flex items-center gap-2">
                        <Car className="h-4 w-4 text-indigo-600" />
                        Driver
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

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Safety Score</p>
                      <p className="font-medium flex items-center gap-1 text-green-600">
                        98
                        <Shield className="h-3 w-3" />
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vehicle">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Vehicle Information</CardTitle>
                    <CardDescription>Details about your vehicle</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="car-model">Vehicle Model</Label>
                        {isEditing ? (
                          <Input
                            id="car-model"
                            name="carModel"
                            value={formData.carModel}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          <div className="p-2 border rounded-md bg-gray-50">{formData.carModel}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="car-color">Vehicle Color</Label>
                        {isEditing ? (
                          <Input
                            id="car-color"
                            name="carColor"
                            value={formData.carColor}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          <div className="p-2 border rounded-md bg-gray-50">{formData.carColor}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="car-plate">License Plate</Label>
                        {isEditing ? (
                          <Input
                            id="car-plate"
                            name="carPlate"
                            value={formData.carPlate}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          <div className="p-2 border rounded-md bg-gray-50">{formData.carPlate}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="car-year">Year</Label>
                        {isEditing ? (
                          <Input id="car-year" name="carYear" defaultValue="2023" required />
                        ) : (
                          <div className="p-2 border rounded-md bg-gray-50">2023</div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="green-car">Electric/Hybrid Vehicle</Label>
                        <p className="text-sm text-muted-foreground">Is your vehicle electric or hybrid?</p>
                      </div>
                      <Switch
                        id="green-car"
                        checked={formData.isGreenCar}
                        onCheckedChange={(checked) => handleSwitchChange("isGreenCar", checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="car-inspection">Vehicle Inspection</Label>
                        <p className="text-sm text-muted-foreground">Last inspection: March 15, 2025</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Up to date</Badge>
                    </div>

                    {isEditing && (
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">
                        Save Vehicle Information
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Your Ratings & Reviews</CardTitle>
                <CardDescription>See how riders have rated you</CardDescription>
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
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "75%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">75%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">4</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="w-full max-w-md mx-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "15%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">15%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">3</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="w-full max-w-md mx-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "5%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">5%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">2</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="w-full max-w-md mx-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "3%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">3%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">1</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="w-full max-w-md mx-2">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: "2%" }}></div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">2%</span>
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
                                <AvatarFallback>AR</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">Alex R.</span>
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
                          <p className="mt-2 text-sm">
                            Great driver! Very professional and got me to my destination quickly.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">April 2, 2025</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>JS</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">Jane S.</span>
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
                          <p className="mt-2 text-sm">Clean car and pleasant conversation. Would ride again.</p>
                          <p className="text-xs text-muted-foreground mt-1">March 28, 2025</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          You haven't received any reviews yet. Complete rides to get reviews from riders.
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
    </DriverLayout>
  )
}

