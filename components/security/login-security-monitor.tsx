"use client"

import React, { useState, useEffect } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertTriangle, CheckCircle, AlertCircle, Fingerprint, Smartphone, MapPin, Lock } from "lucide-react"
import { analyzeLoginSecurity, DeviceFingerprint } from "@/lib/security-service"
import { Location } from "@/lib/types"

interface LoginSecurityMonitorProps {
  onVerify?: () => void
  onReject?: () => void
}

export function LoginSecurityMonitor({ onVerify, onReject }: LoginSecurityMonitorProps) {
  const { user } = useAppContext()
  const [securityAnalysis, setSecurityAnalysis] = useState<{
    isSuspicious: boolean,
    suspiciousFactors: string[],
    riskScore: number,
    recommendedAction: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionTaken, setActionTaken] = useState(false)

  // Mock function to get current device info
  const getCurrentDeviceInfo = (): DeviceFingerprint => {
    return {
      uniqueId: "device-" + Math.floor(Math.random() * 1000),
      operatingSystem: navigator.platform,
      browser: navigator.userAgent.split(" ").pop() || "Unknown",
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lastLogin: new Date().toISOString()
    }
  }

  // Mock function to get current location
  const getCurrentLocation = (): Location => {
    // In a real app, this would use geolocation API
    return { lat: 40.7128, lng: -74.0060, address: "New York, NY" }
  }

  // Mock function to get user login history
  const getUserLoginHistory = () => {
    // In a real app, this would come from the database
    return {
      previousLogins: [
        {
          deviceInfo: {
            uniqueId: "device-123",
            operatingSystem: "macOS",
            browser: "Chrome",
            screenResolution: "1440x900",
            timezone: "America/New_York",
            lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
          },
          location: { lat: 40.7128, lng: -74.0060, address: "New York, NY" },
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          loginMethod: "password"
        },
        {
          deviceInfo: {
            uniqueId: "device-456",
            operatingSystem: "macOS",
            browser: "Safari",
            screenResolution: "1440x900",
            timezone: "America/New_York",
            lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
          },
          location: { lat: 40.7128, lng: -74.0060, address: "New York, NY" },
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          loginMethod: "password"
        }
      ],
      commonLocations: [
        { lat: 40.7128, lng: -74.0060, address: "New York, NY" },
        { lat: 40.7484, lng: -73.9857, address: "Manhattan, NY" }
      ]
    }
  }

  // Analyze login security
  const checkLoginSecurity = async () => {
    setIsLoading(true)
    
    // Get current device and location information
    const currentDevice = getCurrentDeviceInfo()
    const currentLocation = getCurrentLocation()
    const loginHistory = getUserLoginHistory()
    
    // Create current login data
    const currentLogin = {
      deviceInfo: currentDevice,
      location: currentLocation,
      timestamp: new Date().toISOString(),
      loginMethod: "password"
    }
    
    try {
      // Call the security service to analyze the login
      const analysis = await analyzeLoginSecurity(currentLogin, loginHistory)
      setSecurityAnalysis(analysis)
    } catch (error) {
      console.error("Error analyzing login security:", error)
      setSecurityAnalysis({
        isSuspicious: true,
        suspiciousFactors: ["Error analyzing login security"],
        riskScore: 50,
        recommendedAction: "Please verify your identity as we encountered an issue analyzing this login attempt."
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle verify action
  const handleVerify = () => {
    setActionTaken(true)
    if (onVerify) onVerify()
  }

  // Handle reject action
  const handleReject = () => {
    setActionTaken(true)
    if (onReject) onReject()
  }

  // Get risk level based on score
  const getRiskLevel = (): "low" | "medium" | "high" => {
    if (!securityAnalysis) return "medium"
    
    const score = securityAnalysis.riskScore
    if (score < 30) return "low"
    if (score < 70) return "medium"
    return "high"
  }

  // Get color based on risk level
  const getRiskColor = (level: "low" | "medium" | "high"): string => {
    switch (level) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-amber-500"
      default:
        return "text-green-600"
    }
  }

  // Get background color based on risk level
  const getRiskBgColor = (level: "low" | "medium" | "high"): string => {
    switch (level) {
      case "high":
        return "bg-red-100"
      case "medium":
        return "bg-amber-100"
      default:
        return "bg-green-100"
    }
  }

  // Run initial security check
  useEffect(() => {
    checkLoginSecurity()
  }, [])

  // Device info display component
  const DeviceInfo = () => {
    const device = getCurrentDeviceInfo()
    return (
      <div className="border rounded-md p-3 space-y-2">
        <h3 className="text-sm font-medium flex items-center">
          <Smartphone className="h-4 w-4 mr-2" />
          Device Information
        </h3>
        <ul className="space-y-1 text-sm">
          <li className="flex justify-between">
            <span className="text-muted-foreground">OS:</span>
            <span>{device.operatingSystem}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Browser:</span>
            <span>{device.browser}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Screen:</span>
            <span>{device.screenResolution}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Timezone:</span>
            <span>{device.timezone}</span>
          </li>
        </ul>
      </div>
    )
  }

  // Location info display component
  const LocationInfo = () => {
    const location = getCurrentLocation()
    return (
      <div className="border rounded-md p-3 space-y-2">
        <h3 className="text-sm font-medium flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Login Location
        </h3>
        <div className="text-sm">
          <p>{location.address}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-indigo-600" />
          Login Security Check
        </CardTitle>
        <CardDescription>
          AI-powered login security analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-sm text-muted-foreground">Analyzing login security...</p>
          </div>
        ) : securityAnalysis ? (
          <>
            {/* Risk Score */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Risk Assessment</h3>
                <Badge 
                  variant="outline" 
                  className={`${getRiskBgColor(getRiskLevel())} hover:${getRiskBgColor(getRiskLevel())}`}
                >
                  {getRiskLevel() === "low" ? "Low Risk" : getRiskLevel() === "medium" ? "Medium Risk" : "High Risk"}
                </Badge>
              </div>
              
              <div className="flex items-center">
                <div className={`text-2xl font-bold ${getRiskColor(getRiskLevel())}`}>
                  {securityAnalysis.riskScore}
                </div>
                <Progress 
                  value={100 - securityAnalysis.riskScore} 
                  className="flex-1 ml-4"
                />
              </div>
            </div>
            
            {/* Suspicious Factors */}
            {securityAnalysis.isSuspicious && securityAnalysis.suspiciousFactors.length > 0 && (
              <Alert variant={getRiskLevel() === "high" ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Suspicious Activity Detected</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    {securityAnalysis.suspiciousFactors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Recommended Action */}
            <div className="border rounded-md p-3 bg-gray-50">
              <h3 className="text-sm font-medium mb-1 flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Recommended Action
              </h3>
              <p className="text-sm">{securityAnalysis.recommendedAction}</p>
            </div>
            
            {/* Device and Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DeviceInfo />
              <LocationInfo />
            </div>
            
            {/* Action Buttons */}
            {!actionTaken && (
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleVerify}
                  className="flex-1"
                  variant={securityAnalysis.isSuspicious ? "outline" : "default"}
                >
                  <Fingerprint className="mr-2 h-4 w-4" />
                  {securityAnalysis.isSuspicious ? "Verify It's Me" : "Continue Login"}
                </Button>
                
                {securityAnalysis.isSuspicious && (
                  <Button 
                    onClick={handleReject}
                    className="flex-1"
                    variant="destructive"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Reject Login
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500" />
            <p className="mt-2">Unable to perform security analysis</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <p className="text-xs text-muted-foreground w-full text-center">
          Powered by Gemini AI security analysis
        </p>
      </CardFooter>
    </Card>
  )
} 