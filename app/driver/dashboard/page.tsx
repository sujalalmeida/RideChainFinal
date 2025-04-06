"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DriverLayout } from "@/components/layouts/driver-layout"
import { AlertCircle, Calendar, Car, Clock, DollarSign, MapPin, Star, TrendingUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAppContext } from "@/contexts/app-context"
import { EmptyState } from "@/components/empty-state"

// Mock incoming request for demo purposes
const mockIncomingRequest = {
  id: "request-001",
  date: new Date().toLocaleString(),
  from: "555 Park Ave",
  to: "777 Lake St",
  price: 8.5,
  status: "pending",
  estimatedDistance: "2.3 miles",
  estimatedTime: "12 min",
  rider: {
    id: "rider-001",
    name: "Jordan K.",
    rating: 4.6,
    avatar: "/placeholder.svg?height=40&width=40",
  },
}

export default function DriverDashboard() {
  const {
    user,
    rides,
    isDriverAvailable,
    setIsDriverAvailable,
    incomingRequests,
    setIncomingRequests,
    acceptRideRequest,
    loading,
  } = useAppContext()

  // Filter rides by status
  const completedRides = rides.filter(
    (ride) => ride.status === "completed" || ride.status === "completed" || ride.status === "rated",
  )

  // Generate a mock incoming request when driver is available
  useEffect(() => {
    if (isDriverAvailable && incomingRequests.length === 0) {
      // Add a mock incoming request after a delay
      const timer = setTimeout(() => {
        setIncomingRequests([mockIncomingRequest])
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isDriverAvailable, incomingRequests.length, setIncomingRequests])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRideRequest(requestId)
    } catch (error) {
      console.error("Error accepting ride request:", error)
    }
  }

  return (
    <DriverLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Driver Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name?.split(" ")[0] || "Driver"}! Manage your rides and earnings.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
            <Label htmlFor="availability" className="font-medium">
              Available for Rides
            </Label>
            <Switch id="availability" checked={isDriverAvailable} onCheckedChange={setIsDriverAvailable} />
          </div>
        </div>

        {isDriverAvailable && incomingRequests.length > 0 && (
          <Alert className="bg-indigo-50 border-indigo-200">
            <AlertCircle className="h-4 w-4 text-indigo-600" />
            <AlertTitle className="text-indigo-600">New Ride Request</AlertTitle>
            <AlertDescription className="text-indigo-700">
              You have a new ride request. Check the incoming requests tab.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${user?.walletBalance?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">
                {completedRides.length > 0
                  ? `From ${completedRides.length} completed ${completedRides.length === 1 ? "ride" : "rides"}`
                  : "No earnings yet today"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.totalRides || 0}</div>
              <p className="text-xs text-muted-foreground">
                {user?.totalRides ? "All time" : "No rides completed yet"}
              </p>
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
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList>
            <TabsTrigger value="history">Ride History</TabsTrigger>
            <TabsTrigger value="incoming">
              Incoming Requests
              {incomingRequests.length > 0 && <Badge className="ml-2 bg-indigo-600">{incomingRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
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
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                            <span className="text-sm">{ride.from}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                            <span className="text-sm">{ride.to}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2">
                        <div className="text-lg font-bold text-green-600">${(ride.price * 0.8).toFixed(2)}</div>
                        {ride.rider && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={ride.rider.avatar} alt={ride.rider.name} />
                              <AvatarFallback>{ride.rider.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{ride.rider.name}</span>
                            {ride.rider.rating && (
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs ml-1">{ride.rider.rating}</span>
                              </div>
                            )}
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
                title="No Ride History"
                description="You haven't completed any rides yet. Make sure you're set as available to receive ride requests."
              />
            )}
          </TabsContent>

          <TabsContent value="incoming" className="space-y-4">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.rider.avatar} alt={request.rider.name} />
                            <AvatarFallback>{request.rider.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{request.rider.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                              <span>{request.rider.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">New Request</Badge>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                          <span className="text-sm">{request.from}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                          <span className="text-sm">{request.to}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-muted-foreground">Earnings</p>
                          <p className="font-medium text-green-600">${request.price.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-muted-foreground">Distance</p>
                          <p className="font-medium">{request.estimatedDistance}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="font-medium">{request.estimatedTime}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={loading}
                        >
                          {loading ? "Accepting..." : "Accept"}
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
                title="No Incoming Requests"
                description="You don't have any ride requests at the moment. Make sure you're set as available to receive requests."
              />
            )}
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Your earnings will appear here after completing rides</CardDescription>
              </CardHeader>
              <CardContent>
                {completedRides.length > 0 ? (
                  <>
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        <span className="text-muted-foreground">Earnings chart will appear here</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">This Week</span>
                            <span className="text-2xl font-bold text-green-600">
                              ${(user?.walletBalance || 0).toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">This Month</span>
                            <span className="text-2xl font-bold text-green-600">
                              ${(user?.walletBalance || 0).toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={<DollarSign className="h-12 w-12 text-muted-foreground" />}
                    title="No Earnings Yet"
                    description="Complete rides to start earning. Your earnings will be displayed here."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DriverLayout>
  )
}

