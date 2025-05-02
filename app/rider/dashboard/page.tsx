"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RiderLayout } from "@/components/layouts/rider-layout"
import { Bell, Calendar, Car, Clock, CreditCard, Leaf, MapPin, Shield, Star, Users } from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/contexts/app-context"
import { EmptyState } from "@/components/empty-state"
import { Progress } from "@/components/ui/progress"
import { RewardsSystem } from "@/components/gamification/rewards-system"
import { SafetyAssistant } from "@/components/safety-assistant"

export default function RiderDashboard() {
  const { user, rides } = useAppContext()
  const [activeTab, setActiveTab] = useState("overview")

  // Filter rides by status
  const completedRides = rides.filter((ride) => ride.status === "completed" || ride.status === "rated")

  const upcomingRides = rides.filter(
    (ride) => ride.status === "accepted" || ride.status === "arriving" || ride.status === "in_progress",
  )

  // Calculate carbon stats
  const totalCarbonSaved = user?.carbonSaved || 0
  const carbonSavedProgress = Math.min(100, (totalCarbonSaved / 10) * 100) // 10kg as goal

  return (
    <RiderLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name?.split(" ")[0] || "Rider"}! Book a ride or check your history.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/rider/security">
              <Button variant="outline" className="border-indigo-200">
                <Shield className="mr-2 h-4 w-4 text-indigo-600" /> View Security
              </Button>
            </Link>
            <Link href="/rider/book">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Car className="mr-2 h-4 w-4" /> Book a Ride
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-2">
          <SafetyAssistant />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.totalRides || 0}</div>
              {user?.totalRides ? (
                <p className="text-xs text-muted-foreground">
                  {user.totalRides > 0 ? `${completedRides.length} completed rides` : "No rides yet"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Book your first ride today</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${user?.walletBalance?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Available for future rides</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.rating || "N/A"}</div>
              <p className="text-xs text-muted-foreground">
                {user?.totalRides ? `Based on ${user.totalRides} rides` : "No ratings yet"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCarbonSaved.toFixed(2)} kg</div>
              <div className="mt-2">
                <Progress value={carbonSavedProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {carbonSavedProgress < 100
                    ? `${(10 - totalCarbonSaved).toFixed(2)} kg to next achievement`
                    : "Achievement unlocked!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <RewardsSystem className="mb-4" />

        <Tabs defaultValue="recent" className="w-full">
          <TabsList>
            <TabsTrigger value="recent">Recent Rides</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Rides</TabsTrigger>
            <TabsTrigger value="community">Community Rides</TabsTrigger>
            <TabsTrigger value="safety">
              <Shield className="h-4 w-4 mr-2" />
              Safety
            </TabsTrigger>
          </TabsList>
          <TabsContent value="safety" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Safety Features</CardTitle>
                <CardDescription>Configure your safety preferences and emergency contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Link href="/rider/security">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Shield className="mr-2 h-4 w-4" /> 
                      View Enhanced Security Options
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">
                    Access advanced AI-powered security features and additional safety options
                  </p>
                </div>
                <SafetyAssistant />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recent" className="space-y-4">
            {completedRides.length > 0 ? (
              completedRides.map((ride) => (
                <Card key={ride.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{ride.date}</span>
                          <Badge variant="outline" className="ml-2">
                            {ride.status === "rated" ? "Completed" : ride.status}
                          </Badge>
                          {ride.rideType === "green" && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Leaf className="mr-1 h-3 w-3" /> Green Ride
                            </Badge>
                          )}
                          {ride.rideType === "carpool" && (
                            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                              <Users className="mr-1 h-3 w-3" /> Carpool
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                            <span className="text-sm">
                              {typeof ride.from === "string" ? ride.from : ride.from.address}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                            <span className="text-sm">{typeof ride.to === "string" ? ride.to : ride.to.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2">
                        <div className="text-lg font-bold">${ride.price.toFixed(2)}</div>
                        {ride.driver && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={ride.driver.avatar} alt={ride.driver.name} />
                              <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{ride.driver.name}</span>
                            {ride.driver.rating && (
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs ml-1">{ride.driver.rating}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {ride.carbonSaved && ride.carbonSaved > 0 && (
                          <div className="text-xs text-green-600 flex items-center">
                            <Leaf className="h-3 w-3 mr-1" />
                            Saved {ride.carbonSaved.toFixed(2)} kg CO2
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={<Clock className="h-12 w-12 text-muted-foreground" />}
                title="No Recent Rides"
                description="You haven't completed any rides yet. Book a ride to get started."
                action={
                  <Link href="/rider/book">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">Book a Ride</Button>
                  </Link>
                }
              />
            )}
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingRides.length > 0 ? (
              upcomingRides.map((ride) => (
                <Card key={ride.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{ride.date}</span>
                          <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                            {ride.status === "accepted"
                              ? "Scheduled"
                              : ride.status === "arriving"
                                ? "Driver En Route"
                                : ride.status === "in_progress"
                                  ? "In Progress"
                                  : ride.status}
                          </Badge>
                          {ride.rideType === "green" && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Leaf className="mr-1 h-3 w-3" /> Green Ride
                            </Badge>
                          )}
                          {ride.rideType === "carpool" && (
                            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                              <Users className="mr-1 h-3 w-3" /> Carpool
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                            <span className="text-sm">
                              {typeof ride.from === "string" ? ride.from : ride.from.address}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                            <span className="text-sm">{typeof ride.to === "string" ? ride.to : ride.to.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2">
                        <div className="text-lg font-bold">${ride.price.toFixed(2)}</div>
                        <Button variant="outline" size="sm">
                          <Bell className="mr-2 h-4 w-4" /> Reminder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
                title="No Upcoming Rides"
                description="You don't have any scheduled rides. Book a ride now or schedule one for later."
                action={
                  <Link href="/rider/book">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">Book a Ride</Button>
                  </Link>
                }
              />
            )}
          </TabsContent>
          <TabsContent value="community" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Rides</CardTitle>
                <CardDescription>Join community rides to save money and reduce your carbon footprint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.communityId ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-medium">Tech Campus Commuters</h3>
                      <Badge className="ml-auto">Member</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Daily commuters to the tech campus</p>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Upcoming Rides</h4>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm">Downtown → Tech Park</p>
                            <p className="text-xs text-muted-foreground">Weekdays 8:00 AM</p>
                          </div>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Users className="h-12 w-12 text-muted-foreground" />}
                    title="No Community Rides"
                    description="Join a community to access shared rides with people going your way."
                    action={<Button className="bg-indigo-600 hover:bg-indigo-700">Browse Communities</Button>}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RiderLayout>
  )
}

