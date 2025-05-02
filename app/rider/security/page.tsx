"use client"

import React, { useState, useEffect } from "react"
import { RiderLayout } from "@/components/layouts/rider-layout"
import { RideSecurityMonitor } from "@/components/security/ride-security-monitor"
import { LoginSecurityMonitor } from "@/components/security/login-security-monitor"
import { PasswordStrengthAnalyzer } from "@/components/security/password-strength-analyzer"
import { MessageFraudDetector } from "@/components/security/message-fraud-detector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getPersonalizedSecurityRecommendations } from "@/lib/security-service"
import { Shield, Lock, AlertTriangle, Fingerprint, MessageSquare, Bell, Clock, User, Smartphone, Eye, Settings, CheckCircle } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"

export default function RiderSecurityPage() {
  const { user, loading } = useAppContext()
  const [activeTab, setActiveTab] = useState("overview")
  const [password, setPassword] = useState("")
  const [securityRecommendations, setSecurityRecommendations] = useState<string[]>([
    "Enable two-factor authentication for additional account security.",
    "Set up emergency contacts to be notified in case of emergencies.",
    "Regularly review and update your account password.",
    "Verify driver details before entering the vehicle."
  ])
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    biometricEnabled: true,
    locationSharingEnabled: true,
    emergencyContactsConfigured: false,
    rideRecording: false,
    automaticSuspiciousLoginDetection: true,
    realTimeRideMonitoring: true,
    fraudMessageDetection: true
  })

  // Load security recommendations when component mounts
  useEffect(() => {
    if (user) {
      loadSecurityRecommendations()
    }
  }, [user])

  // Load security recommendations from the API
  const loadSecurityRecommendations = async () => {
    if (!user) return

    try {
      // Mock user profile for recommendations
      const userProfile = {
        totalRides: user.totalRides || 10,
        accountAge: "6 months",
        securitySettings: {
          twoFactorEnabled: securitySettings.twoFactorEnabled,
          biometricEnabled: securitySettings.biometricEnabled,
          locationSharingEnabled: securitySettings.locationSharingEnabled,
          emergencyContactsConfigured: securitySettings.emergencyContactsConfigured,
          lastPasswordChange: "2 months ago"
        },
        ridePatterns: {
          commonPickups: ["Home", "Work", "Gym"],
          commonDestinations: ["Work", "Home", "Shopping Mall"],
          typicalRideTimes: ["Morning", "Evening"],
          frequentDrivers: ["Daniel S.", "Maria H."]
        },
        deviceInfo: {
          uniqueId: "device-123",
          operatingSystem: navigator.platform,
          browser: navigator.userAgent.split(" ").pop() || "Unknown",
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          lastLogin: new Date().toISOString()
        }
      }

      const recommendations = await getPersonalizedSecurityRecommendations(userProfile)
      if (recommendations.length > 0) {
        setSecurityRecommendations(recommendations)
      }
    } catch (error) {
      console.error("Error loading security recommendations:", error)
    }
  }

  // Toggle a security setting
  const toggleSetting = (setting: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  // Handle password analysis completion
  const handlePasswordAnalysis = (analysis: any) => {
    console.log("Password analysis:", analysis)
    // In a real app, you might want to save the analysis or update the UI
  }

  return (
    <RiderLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Security Center</h1>
            <p className="text-muted-foreground">
              AI-powered security features to keep you safe
            </p>
          </div>
          
          <Badge 
            variant="outline" 
            className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
          >
            Gemini AI Protected
          </Badge>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ride">Ride Security</TabsTrigger>
            <TabsTrigger value="account">Account Security</TabsTrigger>
            <TabsTrigger value="communication">Fraud Detection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Security Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-indigo-600" />
                  Security Overview
                </CardTitle>
                <CardDescription>
                  Your security status and recommendations
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Security Score */}
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Your Security Score</h3>
                    <p className="text-sm text-muted-foreground">Based on your current settings</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-700">
                      {securitySettings.twoFactorEnabled ? 85 : 70}/100
                    </div>
                    <p className="text-xs text-indigo-600 mt-1">
                      {securitySettings.twoFactorEnabled ? "Good" : "Needs Improvement"}
                    </p>
                  </div>
                </div>
                
                {/* Personalized Recommendations */}
                <div className="space-y-2">
                  <h3 className="text-md font-medium">Recommendations</h3>
                  <ul className="space-y-2">
                    {securityRecommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center"
                    onClick={() => setActiveTab("account")}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Account Security
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center"
                    onClick={() => setActiveTab("ride")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Ride Security
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center"
                    onClick={() => setActiveTab("communication")}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Fraud Detection
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Security Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Lock className="mr-2 h-4 w-4 text-indigo-600" />
                    Account Protection
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">AI-powered login security monitoring</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Password strength analysis</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Suspicious activity detection</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-indigo-600" />
                    Ride Safety
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Real-time ride monitoring with Gemini AI</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Route deviation detection</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Driver verification codes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-indigo-600" />
                    Fraud Detection
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">AI message analysis for scam detection</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Payment security monitoring</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Phishing and social engineering prevention</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Bell className="mr-2 h-4 w-4 text-indigo-600" />
                    Emergency Features
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">One-tap emergency assistance</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Automatic location sharing with contacts</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Voice-activated emergency mode</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="ride" className="space-y-6">
            <Alert variant="default" className="bg-indigo-50 border-indigo-200">
              <Shield className="h-4 w-4 text-indigo-600" />
              <AlertTitle>Ride Security Features</AlertTitle>
              <AlertDescription>
                Explore our AI-powered security features for your rides
              </AlertDescription>
            </Alert>
            
            {/* Demo of the RideSecurityMonitor */}
            <RideSecurityMonitor />
            
            {/* Additional security settings */}
            <Card>
              <CardHeader>
                <CardTitle>Ride Security Settings</CardTitle>
                <CardDescription>
                  Configure how you want to be protected during rides
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="realTimeRideMonitoring">Real-Time Ride Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Monitor your ride for unusual activity</p>
                  </div>
                  <Switch 
                    id="realTimeRideMonitoring" 
                    checked={securitySettings.realTimeRideMonitoring}
                    onCheckedChange={() => toggleSetting("realTimeRideMonitoring")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="locationSharing">Location Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share your location with trusted contacts</p>
                  </div>
                  <Switch 
                    id="locationSharing" 
                    checked={securitySettings.locationSharingEnabled}
                    onCheckedChange={() => toggleSetting("locationSharingEnabled")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="rideRecording">Ride Recording</Label>
                    <p className="text-sm text-muted-foreground">Record audio during rides for security</p>
                  </div>
                  <Switch 
                    id="rideRecording" 
                    checked={securitySettings.rideRecording}
                    onCheckedChange={() => toggleSetting("rideRecording")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <Alert variant="default" className="bg-indigo-50 border-indigo-200">
              <Lock className="h-4 w-4 text-indigo-600" />
              <AlertTitle>Account Security Features</AlertTitle>
              <AlertDescription>
                Protect your account with advanced security features
              </AlertDescription>
            </Alert>
            
            {/* Demo of the LoginSecurityMonitor */}
            <LoginSecurityMonitor />
            
            {/* Password strength analyzer */}
            <Card>
              <CardHeader>
                <CardTitle>Password Security</CardTitle>
                <CardDescription>
                  Check the strength of your password with AI analysis
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="password">Enter a password to analyze</Label>
                  <div className="flex mt-1.5">
                    <Input 
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <PasswordStrengthAnalyzer 
                  password={password}
                  onChange={handlePasswordAnalysis}
                />
              </CardContent>
            </Card>
            
            {/* Account security settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security Settings</CardTitle>
                <CardDescription>
                  Configure additional security features for your account
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require a second verification method</p>
                  </div>
                  <Switch 
                    id="twoFactor" 
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={() => toggleSetting("twoFactorEnabled")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="biometric">Biometric Authentication</Label>
                    <p className="text-sm text-muted-foreground">Use fingerprint or face ID when available</p>
                  </div>
                  <Switch 
                    id="biometric" 
                    checked={securitySettings.biometricEnabled}
                    onCheckedChange={() => toggleSetting("biometricEnabled")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="suspiciousLogin">Suspicious Login Detection</Label>
                    <p className="text-sm text-muted-foreground">Alert when unusual login activity is detected</p>
                  </div>
                  <Switch 
                    id="suspiciousLogin" 
                    checked={securitySettings.automaticSuspiciousLoginDetection}
                    onCheckedChange={() => toggleSetting("automaticSuspiciousLoginDetection")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="communication" className="space-y-6">
            <Alert variant="default" className="bg-indigo-50 border-indigo-200">
              <AlertTriangle className="h-4 w-4 text-indigo-600" />
              <AlertTitle>Fraud Detection Features</AlertTitle>
              <AlertDescription>
                AI-powered tools to protect you from scams and fraud attempts
              </AlertDescription>
            </Alert>
            
            {/* Demo of the MessageFraudDetector */}
            <MessageFraudDetector sender="rider" />
            
            {/* Fraud protection settings */}
            <Card>
              <CardHeader>
                <CardTitle>Fraud Protection Settings</CardTitle>
                <CardDescription>
                  Configure how messages and payment requests are analyzed
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fraudDetection">Automatic Fraud Detection</Label>
                    <p className="text-sm text-muted-foreground">Analyze messages for potential scams</p>
                  </div>
                  <Switch 
                    id="fraudDetection" 
                    checked={securitySettings.fraudMessageDetection}
                    onCheckedChange={() => toggleSetting("fraudMessageDetection")}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="contactsConfig">Emergency Contacts</Label>
                    <p className="text-sm text-muted-foreground">Set up contacts to alert in emergencies</p>
                  </div>
                  <Switch 
                    id="contactsConfig" 
                    checked={securitySettings.emergencyContactsConfigured}
                    onCheckedChange={() => toggleSetting("emergencyContactsConfigured")}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-4">
                <p className="text-xs text-muted-foreground w-full">
                  Our fraud detection system uses Gemini AI to analyze patterns and identify potential threats.
                  No personal data is shared with third parties during analysis.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RiderLayout>
  )
} 