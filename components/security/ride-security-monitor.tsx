"use client"

import React, { useState, useEffect } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, CheckCircle, MapPin, Share2, Phone, MessageCircle, HelpCircle } from "lucide-react"
import { analyzeLiveRideSafety, LiveRideSafetyAnalysis, generateSecureRideCode } from "@/lib/security-service"
import { Location } from "@/lib/types"

interface RideSecurityMonitorProps {
  rideId?: string
}

export function RideSecurityMonitor({ rideId }: RideSecurityMonitorProps) {
  const { user, currentRide } = useAppContext()
  const [safetyAnalysis, setSafetyAnalysis] = useState<LiveRideSafetyAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState<{code: string, expires: Date} | null>(null)
  const [safetyTips, setSafetyTips] = useState<string[]>([
    "Share your trip status with trusted contacts",
    "Verify driver identity before entering the vehicle",
    "Stay in touch with friends or family during your ride"
  ])
  const [activeTab, setActiveTab] = useState("monitor")
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null)

  // Calculate estimated route for demo purposes
  const generateRoutePoints = (): Location[] => {
    if (!currentRide) return []
    
    // For demo, create a simple route (in real app, this would come from mapping service)
    const from = typeof currentRide.from === 'string' 
      ? { lat: 40.7128, lng: -74.0060, address: currentRide.from } 
      : currentRide.from as Location
      
    const to = typeof currentRide.to === 'string'
      ? { lat: 40.7580, lng: -73.9855, address: currentRide.to }
      : currentRide.to as Location
    
    // Create points between start and end
    const points: Location[] = [from]
    
    // Add some intermediate points
    const steps = 4
    for (let i = 1; i <= steps; i++) {
      const ratio = i / (steps + 1)
      points.push({
        lat: from.lat + (to.lat - from.lat) * ratio,
        lng: from.lng + (to.lng - from.lng) * ratio,
        address: `Route point ${i}`
      })
    }
    
    points.push(to)
    return points
  }

  // Mock function to get current location (in a real app, this would use geolocation)
  const getCurrentLocation = (): Location => {
    if (!currentRide) {
      return { lat: 40.7128, lng: -74.0060 }
    }
    
    const from = typeof currentRide.from === 'string' 
      ? { lat: 40.7128, lng: -74.0060, address: currentRide.from } 
      : currentRide.from as Location
      
    const to = typeof currentRide.to === 'string'
      ? { lat: 40.7580, lng: -73.9855, address: currentRide.to }
      : currentRide.to as Location
    
    // Simulate vehicle progress based on time
    const startTime = new Date()
    startTime.setMinutes(startTime.getMinutes() - 5) // Ride started 5 minutes ago
    
    const endTime = new Date()
    endTime.setMinutes(endTime.getMinutes() + 10) // Ride will end in 10 minutes
    
    const now = new Date()
    const totalDuration = endTime.getTime() - startTime.getTime()
    const elapsed = now.getTime() - startTime.getTime()
    const progress = Math.min(1, Math.max(0, elapsed / totalDuration))
    
    // Calculate current position based on progress
    return {
      lat: from.lat + (to.lat - from.lat) * progress,
      lng: from.lng + (to.lng - from.lng) * progress,
      address: "Current location"
    }
  }

  // Analyze ride safety
  const analyzeRideSafety = async () => {
    if (!currentRide) return
    
    setIsLoading(true)
    
    const expectedRoute = generateRoutePoints()
    const currentLocation = getCurrentLocation()
    
    const from = typeof currentRide.from === 'string' 
      ? { lat: 40.7128, lng: -74.0060, address: currentRide.from } 
      : currentRide.from as Location
      
    const to = typeof currentRide.to === 'string'
      ? { lat: 40.7580, lng: -73.9855, address: currentRide.to }
      : currentRide.to as Location
    
    // Create sample ride data
    const rideData = {
      rideId: rideId || "sample-ride-id",
      startLocation: from,
      currentLocation: currentLocation,
      destination: to,
      expectedRoute: expectedRoute,
      startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      currentTime: new Date().toISOString(),
      expectedEndTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
      driver: {
        id: "driver-123",
        rating: 4.8,
        totalRides: 1250
      },
      rider: {
        id: user?.id || "rider-456",
        rating: user?.rating || 4.9,
        totalRides: user?.totalRides || 25
      },
      currentSpeed: 35, // km/h
      averageSpeed: 32, // km/h
      stops: [],
      isRideShared: false
    }
    
    try {
      // Call the security service to analyze the ride
      const analysis = await analyzeLiveRideSafety(rideData)
      setSafetyAnalysis(analysis)
      setLastAnalysisTime(new Date())
    } catch (error) {
      console.error("Error analyzing ride safety:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate a verification code
  const generateVerificationCode = () => {
    const code = generateSecureRideCode()
    setVerificationCode(code)
    
    // In a real app, this would be sent to the driver to verify
    console.log("Generated verification code:", code.code)
    
    // Automatically clear the code after expiration
    setTimeout(() => {
      setVerificationCode(null)
    }, 5 * 60 * 1000) // 5 minutes
  }

  // Get safety score color
  const getSafetyColor = (level: "low" | "medium" | "high" = "low") => {
    switch (level) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-amber-500"
      default:
        return "text-green-600"
    }
  }

  // Get safety score background color
  const getSafetyBgColor = (level: "low" | "medium" | "high" = "low") => {
    switch (level) {
      case "high":
        return "bg-red-100"
      case "medium":
        return "bg-amber-100"
      default:
        return "bg-green-100"
    }
  }

  // Get risk level from safety analysis
  const getRiskLevel = (): "low" | "medium" | "high" => {
    return safetyAnalysis?.currentRiskLevel || "low"
  }

  // Calculate safety score
  const getSafetyScore = (): number => {
    if (!safetyAnalysis) return 95
    
    const riskLevel = safetyAnalysis.currentRiskLevel
    const baseScore = riskLevel === "low" ? 95 : riskLevel === "medium" ? 75 : 50
    
    // Adjust based on neighborhood safety
    return Math.min(100, Math.max(0, baseScore + (safetyAnalysis.neighborhoodSafetyRating - 70) / 3))
  }

  // Share ride status with emergency contacts
  const shareRideStatus = () => {
    // In a real app, this would send the ride status to emergency contacts
    console.log("Sharing ride status with emergency contacts")
    
    // Show success message
    alert("Ride status shared with emergency contacts")
  }

  // Schedule regular safety analysis
  useEffect(() => {
    if (!currentRide) return
    
    // Initial analysis
    analyzeRideSafety()
    
    // Set up periodic analysis
    const interval = setInterval(() => {
      analyzeRideSafety()
    }, 60000) // Every minute
    
    return () => clearInterval(interval)
  }, [currentRide])

  if (!currentRide) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-indigo-600" />
            Ride Security Monitor
          </CardTitle>
          <CardDescription>No active ride to monitor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Book a ride to access security features</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-indigo-600" />
          Ride Security Monitor
        </CardTitle>
        <CardDescription>
          AI-powered real-time ride security monitoring
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
            <TabsTrigger value="tips">Safety Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monitor">
            <div className="space-y-4">
              {/* Safety Score */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Safety Score</h3>
                  <div className="flex items-center">
                    {lastAnalysisTime && (
                      <p className="text-xs text-muted-foreground mr-2">
                        Updated {lastAnalysisTime.toLocaleTimeString()}
                      </p>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={analyzeRideSafety} 
                      disabled={isLoading}
                    >
                      {isLoading ? "Analyzing..." : "Update"}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`text-2xl font-bold ${getSafetyColor(getRiskLevel())}`}>
                    {Math.round(getSafetyScore())}
                  </div>
                  <Progress 
                    value={getSafetyScore()} 
                    className="flex-1 ml-4" 
                  />
                </div>
                
                <Badge 
                  variant="outline" 
                  className={`${getSafetyBgColor(getRiskLevel())} w-fit`}
                >
                  {getRiskLevel() === "low" ? "Low Risk" : 
                   getRiskLevel() === "medium" ? "Medium Risk" : "High Risk"}
                </Badge>
              </div>
              
              {/* Safety Analysis */}
              {safetyAnalysis && (
                <div className="space-y-3 mt-2">
                  {safetyAnalysis.riskFactors.length > 0 && (
                    <Alert variant={
                      getRiskLevel() === "high" ? "destructive" : 
                      getRiskLevel() === "medium" ? "default" : "default"
                    }>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Risk Factors Detected</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-1 text-sm">
                          {safetyAnalysis.riskFactors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="border rounded-md p-2">
                      <p className="text-xs text-muted-foreground">Route Deviation</p>
                      <p className="font-medium">
                        {safetyAnalysis.routeDeviation}% from expected
                      </p>
                    </div>
                    <div className="border rounded-md p-2">
                      <p className="text-xs text-muted-foreground">Neighborhood Safety</p>
                      <p className="font-medium">
                        {safetyAnalysis.neighborhoodSafetyRating}/100
                      </p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-2">
                    <p className="text-xs text-muted-foreground">Speed Analysis</p>
                    <p className="text-sm">{safetyAnalysis.speedAnalysis}</p>
                  </div>
                  
                  {safetyAnalysis.recommendations.length > 0 && (
                    <div className="border rounded-md p-2">
                      <p className="text-xs text-muted-foreground mb-1">Recommendations</p>
                      <ul className="text-sm space-y-1">
                        {safetyAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Emergency Action Buttons */}
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center flex-1 border-indigo-200"
                  onClick={shareRideStatus}
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  Share Status
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="flex items-center justify-center flex-1"
                >
                  <Phone className="h-4 w-4 mr-1.5" />
                  Emergency
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="verify">
            <div className="space-y-4">
              <div className="text-center py-2 px-4 bg-indigo-50 rounded-md">
                <p className="text-sm text-indigo-700">
                  Generate a one-time code to verify your driver's identity
                </p>
              </div>
              
              {verificationCode ? (
                <div className="text-center space-y-2">
                  <div className="border-2 border-indigo-500 rounded-md p-4 bg-indigo-50">
                    <p className="text-xs text-indigo-700 mb-1">Verification Code</p>
                    <p className="text-3xl font-bold tracking-widest text-indigo-700 font-mono">
                      {verificationCode.code}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                      Expires: {verificationCode.expires.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Ask your driver to confirm this code to verify their identity
                  </p>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setVerificationCode(null)}
                    className="mt-2"
                  >
                    Clear Code
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button onClick={generateVerificationCode}>
                    Generate Verification Code
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    The code will be valid for 5 minutes
                  </p>
                </div>
              )}
              
              <div className="border rounded-md p-3 space-y-1">
                <h4 className="text-sm font-medium">Why Verify?</h4>
                <p className="text-xs text-muted-foreground">
                  Verifying your driver's identity helps ensure you're getting into the right vehicle and adds an extra layer of security to your ride.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tips">
            <div className="space-y-4">
              <div className="bg-indigo-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-indigo-800">AI-Generated Safety Tips</h4>
                <p className="text-xs text-indigo-700 mt-1">
                  Personalized recommendations for this ride
                </p>
              </div>
              
              <ul className="space-y-3">
                {safetyTips.map((tip, index) => (
                  <li key={index} className="flex items-start border-b pb-2 last:border-0">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center flex-1"
                  onClick={() => window.open("/safety-center", "_blank")}
                >
                  <HelpCircle className="h-4 w-4 mr-1.5" />
                  Safety Center
                </Button>
                
                <Button 
                  variant="secondary" 
                  className="flex items-center justify-center flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  Support Chat
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-2">
        <p className="text-xs text-muted-foreground w-full text-center">
          Powered by Gemini AI security analysis
        </p>
      </CardFooter>
    </Card>
  )
} 