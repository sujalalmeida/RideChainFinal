"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RiderLayout } from "@/components/layouts/rider-layout"
import { EnhancedMap } from "@/components/interactive-map/enhanced-map"
import { ARView } from "@/components/ar-navigation/ar-view"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Car, Leaf, MessageSquare, Phone, Shield, Star, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/app-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SafetyAssistant } from "@/components/safety-assistant"
import { toast } from "sonner"
import { Location } from "@/lib/types"

// Ride status steps
const rideSteps = [
  { id: 1, label: "Driver Assigned", status: "accepted" },
  { id: 2, label: "Driver En Route", status: "arriving" },
  { id: 3, label: "Arrived at Pickup", status: "arriving" },
  { id: 4, label: "Trip in Progress", status: "in_progress" },
  { id: 5, label: "Completed", status: "completed" },
]

export default function RideTrackingPage() {
  const router = useRouter()
  const { currentRide, updateRideStatus, completeRide } = useAppContext()
  const [currentStep, setCurrentStep] = useState(1)
  const [eta, setEta] = useState(4) // minutes
  const [progress, setProgress] = useState(20)
  const [activeTab, setActiveTab] = useState("status")
  const [showARView, setShowARView] = useState(false)
  const [isRideInProgress, setIsRideInProgress] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [driverPosition, setDriverPosition] = useState<Location>({ lat: 37.7749, lng: -122.4194 })

  // Add these state variables for tracking timeouts and intervals
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const etaUpdateRef = useRef<NodeJS.Timeout | null>(null)
  const driverMovementRef = useRef<NodeJS.Timeout | null>(null)

  // Define shorter durations for quick demo
  const STEP_DURATIONS = {
    "Driver En Route": 5000,  // 5 seconds for driver to arrive
    "Driver Arrived": 3000,   // 3 seconds at pickup
    "In Progress": 7000,      // 7 seconds for the trip
  }

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current)
      if (etaUpdateRef.current) clearInterval(etaUpdateRef.current)
      if (driverMovementRef.current) clearInterval(driverMovementRef.current)
    }
  }, [])

  // Helper function to set the current ride
  const setCurrentRide = (ride: any) => {
    if (updateRideStatus) {
      updateRideStatus(ride)
    }
  }

  // Initialize ride when component mounts
  useEffect(() => {
    if (!currentRide) {
      router.push("/rider/book")
      return
    }
    
    // Set initial step based on ride status
    const initialStatus = currentRide.status
    console.log("Initial ride status:", initialStatus)
    
    // Set appropriate step and progress based on status
    if (initialStatus === "confirmed") {
      setCurrentStep(1)
      setProgress(20)
      progressToNextStep("Driver En Route")
    } else if (initialStatus === "Driver En Route") {
      setCurrentStep(2)
      setProgress(40)
      progressToNextStep("Driver Arrived")
    } else if (initialStatus === "Driver Arrived") {
      setCurrentStep(3)
      setProgress(60)
      progressToNextStep("In Progress")
    } else if (initialStatus === "In Progress") {
      setCurrentStep(4)
      setProgress(80)
      progressToNextStep("Completed")
    }
    
    toast.success("Your ride is now being tracked in real-time")
  }, [currentRide, router])

  // Function to update ride status and progress to next step
  const progressToNextStep = (nextStatus: string) => {
    console.log(`Progressing to ${nextStatus}`)
    
    // Clear any existing timer
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current)
    }
    
    // Update the current ride status immediately
    if (currentRide) {
      const updatedRide = {
        ...currentRide,
        status: nextStatus
      }
      setCurrentRide(updatedRide)
      localStorage.setItem("currentRide", JSON.stringify(updatedRide))
    }
    
    // Set up timer for next status update
    if (nextStatus === "Driver En Route") {
      setEta(Math.floor(STEP_DURATIONS["Driver En Route"] / 1000))
      startEtaCountdown()
      
      progressTimerRef.current = setTimeout(() => {
        progressToNextStep("Driver Arrived")
      }, STEP_DURATIONS["Driver En Route"])
    } 
    else if (nextStatus === "Driver Arrived") {
      setCurrentStep(3)
      setProgress(60)
      toast.success("Your driver has arrived! Please meet them at the pickup location.")
      
      progressTimerRef.current = setTimeout(() => {
        progressToNextStep("In Progress")
      }, STEP_DURATIONS["Driver Arrived"])
    } 
    else if (nextStatus === "In Progress") {
      setCurrentStep(4)
      setProgress(80)
      setIsRideInProgress(true)
      setRemainingTime(Math.floor(STEP_DURATIONS["In Progress"] / 1000))
      startRideTimer()
      toast.success("Your ride has started!")
      
      progressTimerRef.current = setTimeout(() => {
        progressToNextStep("Completed")
      }, STEP_DURATIONS["In Progress"])
    } 
    else if (nextStatus === "Completed") {
      setCurrentStep(5)
      setProgress(100)
      setIsRideInProgress(false)
      toast.success("You have arrived at your destination!")
      
      if (completeRide && currentRide) {
        completeRide(currentRide)
      }
    }
  }

  // Start ETA countdown timer
  const startEtaCountdown = () => {
    if (etaUpdateRef.current) {
      clearInterval(etaUpdateRef.current)
    }
    
    etaUpdateRef.current = setInterval(() => {
      setEta((prevEta) => {
        if (prevEta <= 1) {
          clearInterval(etaUpdateRef.current!)
          return 0
        }
        return prevEta - 1
      })
    }, 1000)
  }

  // Start ride timer countdown
  const startRideTimer = () => {
    if (driverMovementRef.current) {
      clearInterval(driverMovementRef.current)
    }
    
    driverMovementRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(driverMovementRef.current!)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  // Update the RideStatus component to handle setting driver location for the map
  useEffect(() => {
    // Set driver location based on current step
    const defaultLocation = { lng: -122.4194, lat: 37.7749 }; // San Francisco
    const pickupLocation = currentRide?.pickup || defaultLocation;
    const destinationLocation = currentRide?.destination || defaultLocation;
    
    let driverLocation;
    
    if (currentStep === 1) {
      // Driver assigned - start at a random position near pickup
      driverLocation = {
        lng: (typeof pickupLocation === 'string' ? defaultLocation.lng : pickupLocation.lng) - 0.005 - Math.random() * 0.005,
        lat: (typeof pickupLocation === 'string' ? defaultLocation.lat : pickupLocation.lat) - 0.005 - Math.random() * 0.005
      };
    } else if (currentStep === 2) {
      // Driver en route - closer to pickup
      driverLocation = {
        lng: (typeof pickupLocation === 'string' ? defaultLocation.lng : pickupLocation.lng) - 0.002 - Math.random() * 0.001,
        lat: (typeof pickupLocation === 'string' ? defaultLocation.lat : pickupLocation.lat) - 0.002 - Math.random() * 0.001
      };
    } else if (currentStep === 3) {
      // Driver arrived at pickup
      driverLocation = {
        lng: typeof pickupLocation === 'string' ? defaultLocation.lng : pickupLocation.lng,
        lat: typeof pickupLocation === 'string' ? defaultLocation.lat : pickupLocation.lat
      };
    } else if (currentStep === 4) {
      // Trip in progress - somewhere between pickup and destination
      const pickupLng = typeof pickupLocation === 'string' ? defaultLocation.lng : pickupLocation.lng;
      const pickupLat = typeof pickupLocation === 'string' ? defaultLocation.lat : pickupLocation.lat;
      const destLng = typeof destinationLocation === 'string' ? defaultLocation.lng : destinationLocation.lng;
      const destLat = typeof destinationLocation === 'string' ? defaultLocation.lat : destinationLocation.lat;
      
      // Calculate progress (0-1) based on current progress value
      const progressFraction = progress / 100;
      
      driverLocation = {
        lng: pickupLng + (destLng - pickupLng) * progressFraction,
        lat: pickupLat + (destLat - pickupLat) * progressFraction
      };
    } else {
      // Completed - at destination
      driverLocation = {
        lng: typeof destinationLocation === 'string' ? defaultLocation.lng : destinationLocation.lng,
        lat: typeof destinationLocation === 'string' ? defaultLocation.lat : destinationLocation.lat
      };
    }
    
    setDriverPosition(driverLocation);
  }, [currentStep, progress, currentRide]);

  // If no current ride, show loading or redirect
  if (!currentRide) {
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
          <h1 className="text-2xl font-bold tracking-tight">Ride in Progress</h1>
          <p className="text-muted-foreground">Track your ride in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="status" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="driver">Driver</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
              </TabsList>

              <TabsContent value="status">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Ride Status</CardTitle>
                    <CardDescription>Current status of your ride</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progress} className="h-2 mb-6" />

                    <div className="space-y-4">
                      {rideSteps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3">
                          <div
                            className={`rounded-full p-1.5 ${
                              step.id < currentStep
                                ? "bg-green-100 text-green-700"
                                : step.id === currentStep
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {step.id < currentStep ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-check"
                              >
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            ) : (
                              <span className="flex h-4 w-4 items-center justify-center text-xs font-medium">
                                {step.id}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              step.id < currentStep
                                ? "text-green-700 font-medium"
                                : step.id === currentStep
                                  ? "text-indigo-700 font-medium"
                                  : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </span>
                          {step.id === currentStep && (
                            <Badge
                              variant="outline"
                              className="ml-auto bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {currentRide.route && (
                      <div className="mt-6 space-y-2">
                        <h3 className="text-sm font-medium">Route Information</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Distance</p>
                            <p className="font-medium">{currentRide.route.distance}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="font-medium">{currentRide.route.duration}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentRide.rideType &&
                      (currentRide.rideType === "green" || currentRide.rideType === "carpool") && (
                        <div className="mt-4">
                          <Alert className="bg-green-50 border-green-200">
                            {currentRide.rideType === "green" ? (
                              <>
                                <Leaf className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-600">Green Ride</AlertTitle>
                                <AlertDescription className="text-green-700">
                                  You're saving approximately {currentRide.carbonSaved?.toFixed(2)} kg of CO2 with this
                                  electric vehicle!
                                </AlertDescription>
                              </>
                            ) : (
                              <>
                                <Users className="h-4 w-4 text-indigo-600" />
                                <AlertTitle className="text-indigo-600">Carpool Ride</AlertTitle>
                                <AlertDescription className="text-indigo-700">
                                  By sharing this ride, you're reducing emissions and traffic congestion.
                                </AlertDescription>
                              </>
                            )}
                          </Alert>
                        </div>
                      )}

                    <div className="mt-6">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowARView(true)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M21 9v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          <path d="M9 17v4"></path>
                          <path d="M15 17v4"></path>
                          <path d="M9 2v5"></path>
                          <path d="M15 2v5"></path>
                        </svg>
                        View in AR
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="driver">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Driver Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentRide.driver && (
                      <>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={currentRide.driver.avatar} alt={currentRide.driver.name} />
                            <AvatarFallback>{currentRide.driver.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{currentRide.driver.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                              <span>{currentRide.driver.rating} • Professional Driver</span>
                            </div>
                            {currentRide.driver.safetyScore && (
                              <div className="flex items-center mt-1">
                                <Shield className="h-3 w-3 text-green-600 mr-1" />
                                <span className="text-xs text-green-600">
                                  Safety Score: {currentRide.driver.safetyScore}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Vehicle</span>
                            <span className="font-medium">{currentRide.driver.car.model}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Color</span>
                            <span className="font-medium">{currentRide.driver.car.color}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">License Plate</span>
                            <span className="font-medium">{currentRide.driver.car.plate}</span>
                          </div>
                          {currentRide.driver.car.isGreen && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Vehicle Type</span>
                              <span className="font-medium text-green-600 flex items-center">
                                <Leaf className="h-3 w-3 mr-1" /> Electric
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" className="flex-1">
                            <Phone className="mr-2 h-4 w-4" /> Call
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <MessageSquare className="mr-2 h-4 w-4" /> Message
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="safety">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Safety Assistant</CardTitle>
                    <CardDescription>AI-powered safety monitoring and assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SafetyAssistant />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Live Tracking</CardTitle>
                  <CardDescription>
                    {currentStep === 2 ? (
                      <>Driver is on the way. ETA: {eta} minutes</>
                    ) : currentStep === 3 ? (
                      <>Driver has arrived at pickup location</>
                    ) : currentStep === 4 ? (
                      <>En route to destination</>
                    ) : (
                      <>Ride completed</>
                    )}
                  </CardDescription>
                </div>
                {currentStep < 3 && (
                  <Badge className="bg-indigo-600">
                    <Car className="mr-1 h-3 w-3" />
                    {eta > 0 ? `${eta} min away` : "Arriving now"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[500px]">
              {showARView ? (
                <ARView currentRide={currentRide} showFullAR={true} onClose={() => setShowARView(false)} />
              ) : (
                <EnhancedMap
                  pickup={currentRide.from}
                  destination={currentRide.to}
                  showRoute={true}
                  showDriver={true}
                  driverLocation={driverPosition}
                  currentStep={currentStep}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RiderLayout>
  )
}

