"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RiderLayout } from "@/components/layouts/rider-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Star, Car, CreditCard, Phone, MessageSquare, MapPin, Navigation, Clock, Share2, AlertTriangle, Zap, MapIcon, Info, Umbrella } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import type { RideType, Location, Driver } from "@/contexts/app-context"
import { estimateRoute, RouteEstimate, getRouteInsights, RouteInsights, WeatherInsight, getWeatherInsights } from "@/lib/gemini-service"
import { toast } from "sonner"
import { RideAnalyticsCard } from "@/components/ride-tracking/ride-analytics-card"

interface RideDetails {
  id: string;
  from: Location;
  to: Location;
  price: number;
  date: string;
  status: string;
  driver: Driver;
  rideType: RideType;
  carbonFootprint: number;
  carbonSaved: number;
  route: {
    distance: string;
    duration: string;
  };
  paymentMethod: string;
  routeInfo?: RouteEstimate;
}

export default function TrackingPage() {
  const router = useRouter()
  const { getCurrentRide } = useAppContext()

  // Ride progress states
  const [progress, setProgress] = useState(10)
  const [rideStatus, setRideStatus] = useState<"arriving" | "pickedup" | "enroute" | "completed">("arriving")
  const [activeTab, setActiveTab] = useState("status")
  
  // Ride details from session storage or context
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null)
  
  // AI insights
  const [routeInsights, setRouteInsights] = useState<RouteInsights | null>(null)
  const [weatherInsights, setWeatherInsights] = useState<WeatherInsight | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)

  // Initialize ride details from session storage or context
  useEffect(() => {
    // Try to get ride details from session storage first
    try {
      const storedRide = sessionStorage.getItem('currentRide');
      if (storedRide) {
        const parsedRide = JSON.parse(storedRide);
        setRideDetails(parsedRide);
        console.log("Loaded ride details from session storage:", parsedRide);
        return;
      }
    } catch (e) {
      console.error("Error reading from session storage:", e);
    }
    
    // Fallback to context API
    const contextRide = getCurrentRide ? getCurrentRide() : null;
    if (contextRide) {
      setRideDetails(contextRide as RideDetails);
      console.log("Loaded ride details from context:", contextRide);
    }
  }, [getCurrentRide]);
  
  // Load insights when ride details are available
  useEffect(() => {
    if (rideDetails?.from && rideDetails?.to) {
      loadInsights();
    }
  }, [rideDetails]);

  // Simulate ride progress
  useEffect(() => {
    // Only start the simulation if we have ride details
    if (!rideDetails) return;
    
    const timer = setTimeout(() => {
      if (progress < 33) {
        setProgress((prev) => Math.min(prev + 5, 33))
      } else if (progress >= 33 && progress < 66) {
        setRideStatus("pickedup")
        setProgress((prev) => Math.min(prev + 5, 66))
      } else if (progress >= 66 && progress < 100) {
        setRideStatus("enroute")
        setProgress((prev) => Math.min(prev + 5, 100))
      } else if (progress === 100 && rideStatus !== "completed") {
        setRideStatus("completed")
        toast.success("You have reached your destination!")
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [progress, rideStatus, rideDetails])

  // Load route and weather insights
  const loadInsights = async () => {
    if (!rideDetails?.from || !rideDetails?.to) return;
    
    setIsLoadingInsights(true);
    
    try {
      // Load insights in parallel
      const [routeData, weatherData] = await Promise.all([
        getRouteInsights(rideDetails.from, rideDetails.to),
        getWeatherInsights(rideDetails.from, rideDetails.to)
      ]);
      
      setRouteInsights(routeData);
      setWeatherInsights(weatherData);
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Generate driver ETA text based on progress
  const getDriverEta = () => {
    if (progress < 33) {
      return `${Math.ceil((33 - progress) / 5)} minutes away`;
    } else if (progress >= 33 && progress < 66) {
      return "Driver has arrived";
    } else if (progress >= 66 && progress < 100) {
      return `${Math.ceil((100 - progress) / 5)} minutes to destination`;
    } else {
      return "Arrived at destination";
    }
  };

  if (!rideDetails) {
    return (
      <RiderLayout>
        <div className="p-4 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>No Active Ride</CardTitle>
              <CardDescription>You don't have any active rides at the moment</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/rider/book")}>Book a Ride</Button>
            </CardContent>
          </Card>
        </div>
      </RiderLayout>
    );
  }

  return (
    <RiderLayout>
      <div className="p-4 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Track Your Ride</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your ride progress</p>
        </div>
        
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Ride Progress</span>
                  <span className="font-medium">
                    {rideStatus === "arriving" && "Driver arriving"}
                    {rideStatus === "pickedup" && "Picked up"}
                    {rideStatus === "enroute" && "On the way"}
                    {rideStatus === "completed" && "Completed"}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-4 text-center text-sm">
                <div className={`${progress >= 10 ? "text-indigo-600 font-medium" : "text-gray-400"}`}>
                  Confirmed
                </div>
                <div className={`${progress >= 33 ? "text-indigo-600 font-medium" : "text-gray-400"}`}>
                  Driver Arrived
                </div>
                <div className={`${progress >= 66 ? "text-indigo-600 font-medium" : "text-gray-400"}`}>
                  In Transit
                </div>
                <div className={`${progress >= 100 ? "text-indigo-600 font-medium" : "text-gray-400"}`}>
                  Completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Driver Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Your Driver</span>
                  {rideStatus === "arriving" && (
                    <Badge className="bg-yellow-100 text-yellow-800">{getDriverEta()}</Badge>
                  )}
                  {rideStatus === "completed" && (
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={rideDetails.driver.avatar} alt={rideDetails.driver.name} />
                    <AvatarFallback>{rideDetails.driver.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{rideDetails.driver.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm ml-1">{rideDetails.driver.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                      <Car className="h-4 w-4" />
                      <span>
                        {rideDetails.driver.car.model} • {rideDetails.driver.car.color} • {rideDetails.driver.car.plate}
                      </span>
                    </div>
                    
                    {rideDetails.driver.car.isGreen && (
                      <Badge className="mt-2 bg-green-100 text-green-800 font-normal text-xs">Electric Vehicle</Badge>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <Phone className="h-3 w-3" />
                        <span>Call</span>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>Message</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Ride Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ride Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <MapPin className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium">From</div>
                      <div className="text-sm text-gray-500">{rideDetails.from.address}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Navigation className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">To</div>
                      <div className="text-sm text-gray-500">{rideDetails.to.address}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-sm text-gray-500">Distance</div>
                    <div className="font-medium">{rideDetails.route.distance}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{rideDetails.route.duration}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Ride Type</div>
                    <div className="font-medium capitalize">{rideDetails.rideType}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Payment</div>
                    <div className="font-medium capitalize">{rideDetails.paymentMethod}</div>
                  </div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Fare</span>
                    <span className="font-bold text-lg">${rideDetails.price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column (wider) */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI-Powered Analytics Card - replaces the map */}
            <RideAnalyticsCard 
              pickup={rideDetails.from}
              destination={rideDetails.to}
              rideType={rideDetails.rideType}
              fareAmount={rideDetails.price}
              progress={progress}
            />
            
            <Card className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-3">
                <div className="text-lg font-medium mb-2">Journey Details</div>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 w-full mx-6 mb-2">
                    <TabsTrigger value="status" className="text-sm">Status Updates</TabsTrigger>
                    <TabsTrigger value="weather" className="text-sm">Weather</TabsTrigger>
                    <TabsTrigger value="insights" className="text-sm">Route Insights</TabsTrigger>
                  </TabsList>
                
                  {/* Status Tab Content */}
                  <TabsContent value="status">
                    <div className="p-6">
                      <div className="mb-5">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Clock className="h-5 w-5 text-indigo-600" />
                          <span>Status Updates</span>
                        </h3>
                      </div>
                      
                      <div className="space-y-5 relative">
                        <div className="absolute left-[9px] top-[24px] bottom-0 w-[2px] bg-gray-200"></div>
                        
                        <div className="flex gap-3 relative">
                          <div className={`w-5 h-5 rounded-full ${progress >= 10 ? 'bg-indigo-600' : 'bg-gray-300'} mt-0.5 z-10`}></div>
                          <div>
                            <div className="font-medium">Ride Confirmed</div>
                            <div className="text-sm text-gray-500">Your booking has been confirmed</div>
                            <div className="text-xs text-gray-400 mt-1">Now</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 relative">
                          <div className={`w-5 h-5 rounded-full ${progress >= 33 ? 'bg-indigo-600' : 'bg-gray-300'} mt-0.5 z-10`}></div>
                          <div>
                            <div className="font-medium">Driver Arrived</div>
                            <div className="text-sm text-gray-500">
                              {progress >= 33 
                                ? `${rideDetails.driver.name} has arrived at your pickup location` 
                                : `${rideDetails.driver.name} is on the way to your location`}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {progress >= 33 ? 'Just now' : getDriverEta()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 relative">
                          <div className={`w-5 h-5 rounded-full ${progress >= 66 ? 'bg-indigo-600' : 'bg-gray-300'} mt-0.5 z-10`}></div>
                          <div>
                            <div className="font-medium">On the Way</div>
                            <div className="text-sm text-gray-500">
                              {progress >= 66 
                                ? "You are on your way to the destination" 
                                : "Waiting for pickup"}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {progress >= 66 && progress < 100 
                                ? `Estimated arrival in ${Math.ceil((100 - progress) / 5)} minutes` 
                                : progress >= 100 
                                  ? 'Completed' 
                                  : 'Waiting for pickup'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 relative">
                          <div className={`w-5 h-5 rounded-full ${progress >= 100 ? 'bg-green-600' : 'bg-gray-300'} mt-0.5 z-10`}></div>
                          <div>
                            <div className="font-medium">Destination Reached</div>
                            <div className="text-sm text-gray-500">
                              {progress >= 100 
                                ? "You have reached your destination" 
                                : "Waiting to reach destination"}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {progress >= 100 ? 'Just now' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Status Information */}
                      {progress >= 33 && progress < 100 && (
                        <div className="mt-8 bg-indigo-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-indigo-600" />
                            <span className="font-medium">Journey Status</span>
                          </div>
                          <p className="text-sm text-indigo-700 mt-1">
                            {progress >= 33 && progress < 66 
                              ? "Your driver has arrived. Please proceed to the pickup location."
                              : `You are ${Math.ceil((100 - progress) / 5)} minutes away from your destination.`}
                          </p>
                        </div>
                      )}
                      
                      {progress >= 100 && (
                        <div className="mt-8 bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Ride Completed</span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            You have reached your destination. Thank you for riding with us!
                          </p>
                          <Button 
                            className="mt-3 gap-1 bg-green-600 hover:bg-green-700"
                            size="sm"
                            onClick={() => router.push("/rider/book")}
                          >
                            <Car className="h-4 w-4" />
                            <span>Book Another Ride</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Weather Tab Content */}
                  <TabsContent value="weather">
                    <div className="p-6">
                      <div className="mb-5">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Zap className="h-5 w-5 text-indigo-600" />
                          <span>Live Weather Updates</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Real-time weather information for your journey</p>
                      </div>
                      
                      {isLoadingInsights ? (
                        <div className="space-y-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ) : weatherInsights ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold flex items-center gap-2">
                              {weatherInsights.temperature}
                              <span className="text-base font-normal text-gray-500">{weatherInsights.condition}</span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Umbrella className="h-4 w-4 text-blue-500" />
                              <span>{weatherInsights.precipitation}</span>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                            <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
                            <p className="text-sm text-blue-700">{weatherInsights.recommendation}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-500">Weather information is not available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Route Insights Tab Content */}
                  <TabsContent value="insights">
                    <div className="p-6">
                      <div className="mb-5">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <MapIcon className="h-5 w-5 text-indigo-600" />
                          <span>Route Insights</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">AI-powered insights about your journey</p>
                      </div>
                      
                      {isLoadingInsights ? (
                        <div className="space-y-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ) : routeInsights ? (
                        <div className="space-y-6">
                          {/* Landmarks section */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">Notable Landmarks</h4>
                            <div className="space-y-2">
                              {routeInsights.landmarks.map((landmark, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-indigo-600" />
                                  <span>{landmark}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Traffic alerts */}
                          {routeInsights.trafficAlerts.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Traffic Alerts</h4>
                              {routeInsights.trafficAlerts.map((alert, index) => (
                                <div key={index} className="flex items-start gap-2 mb-2 bg-amber-50 p-2 rounded-md">
                                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                  <span className="text-sm text-amber-700">{alert}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Weather impact */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">Weather Impact</h4>
                            <div className="text-sm">{routeInsights.weatherImpact}</div>
                          </div>
                          
                          {/* Alternative route */}
                          {routeInsights.alternativeRoute && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                                <Navigation className="h-4 w-4 text-indigo-600" />
                                <span>Alternative Route</span>
                              </h4>
                              <p className="text-sm">{routeInsights.alternativeRoute.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  {routeInsights.alternativeRoute.timeDifference}
                                </span>
                                <span>
                                  {routeInsights.alternativeRoute.distanceDifference}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-500">Route insights are not available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {progress < 100 && (
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    toast.success("Ride status shared with your contacts");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Ride Status</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RiderLayout>
  )
}

