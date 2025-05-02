"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Car, 
  TrendingUp, 
  LineChart, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Leaf, 
  Zap, 
  Award, 
  CheckCircle, 
  BadgePercent,
  BarChart3
} from "lucide-react"
import { 
  getRideEfficiencyAnalysis, 
  RideEfficiencyAnalysis, 
  getSmartTravelTips, 
  SmartTravelTip 
} from "@/lib/gemini-service"
import { Location } from "@/contexts/app-context"
import { toast } from "sonner"

interface RideAnalyticsCardProps {
  pickup: Location;
  destination: Location;
  rideType: string;
  fareAmount: number;
  progress: number;
}

export function RideAnalyticsCard({ 
  pickup, 
  destination, 
  rideType, 
  fareAmount,
  progress 
}: RideAnalyticsCardProps) {
  const [activeTab, setActiveTab] = useState("efficiency")
  const [efficiencyData, setEfficiencyData] = useState<RideEfficiencyAnalysis | null>(null)
  const [travelTips, setTravelTips] = useState<SmartTravelTip[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true)
      try {
        const [efficiencyResults, tipsResults] = await Promise.all([
          getRideEfficiencyAnalysis(pickup, destination, rideType, fareAmount),
          getSmartTravelTips([], { 
            ecoFriendly: rideType === "green", 
            costSensitive: rideType === "carpool" || rideType === "standard",
            comfortPreferred: rideType === "premium"
          })
        ])
        
        setEfficiencyData(efficiencyResults)
        setTravelTips(tipsResults)
      } catch (error) {
        console.error("Error loading ride analytics:", error)
        toast.error("Could not load ride analytics")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAnalytics()
  }, [pickup, destination, rideType, fareAmount])

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-amber-600"
    return "text-red-600"
  }

  // Get badge style based on category
  const getTipBadgeStyle = (category: string) => {
    switch (category) {
      case "time":
        return "bg-blue-100 text-blue-800"
      case "cost":
        return "bg-violet-100 text-violet-800"
      case "comfort":
        return "bg-orange-100 text-orange-800"
      case "sustainability":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get icon based on category
  const getTipIcon = (category: string) => {
    switch (category) {
      case "time":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "cost":
        return <DollarSign className="h-5 w-5 text-violet-600" />
      case "comfort":
        return <Award className="h-5 w-5 text-orange-600" />
      case "sustainability":
        return <Leaf className="h-5 w-5 text-green-600" />
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>AI Ride Analytics</span>
          <Badge className="bg-indigo-100 text-indigo-800">Gemini AI</Badge>
        </CardTitle>
        <CardDescription>Real-time insights and personalized recommendations</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="efficiency" className="text-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Ride Efficiency
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-sm">
              <Zap className="h-4 w-4 mr-2" />
              Smart Tips
            </TabsTrigger>
          </TabsList>
          
          {/* Efficiency Analysis Tab */}
          <TabsContent value="efficiency">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-20 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-24 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
            ) : efficiencyData ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Overall Efficiency Score</h3>
                    <div className="text-2xl font-bold mt-1">
                      {efficiencyData.efficiencyScore}/100
                    </div>
                  </div>
                  
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                    <span className={`text-xl font-bold ${getScoreColor(efficiencyData.efficiencyScore)}`}>
                      {efficiencyData.efficiencyScore}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                {/* Detailed Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Time Efficiency</span>
                    </h4>
                    <p className="text-xs text-gray-600">{efficiencyData.timeEfficiency}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                      <DollarSign className="h-4 w-4 text-violet-600" />
                      <span>Cost Efficiency</span>
                    </h4>
                    <p className="text-xs text-gray-600">{efficiencyData.costEfficiency}</p>
                  </div>
                </div>
                
                {/* Sustainability Score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium flex items-center gap-1">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span>Sustainability Score</span>
                    </h4>
                    <span className={`text-sm font-medium ${getScoreColor(efficiencyData.sustainabilityScore)}`}>
                      {efficiencyData.sustainabilityScore}/100
                    </span>
                  </div>
                  <Progress 
                    value={efficiencyData.sustainabilityScore} 
                    className="h-2"
                  />
                </div>
                
                {/* Recommendations */}
                <div>
                  <h4 className="text-sm font-medium mb-2">AI Recommendations</h4>
                  <ul className="space-y-2">
                    {efficiencyData.recommendations.map((rec, index) => (
                      <li key={index} className="text-xs flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Ride Progress Visualization */}
                <Alert 
                  className={
                    progress < 33 ? "bg-blue-50 border-blue-200" :
                    progress < 66 ? "bg-indigo-50 border-indigo-200" :
                    progress < 100 ? "bg-amber-50 border-amber-200" :
                    "bg-green-50 border-green-200"
                  }
                >
                  <TrendingUp className={
                    progress < 33 ? "h-4 w-4 text-blue-600" :
                    progress < 66 ? "h-4 w-4 text-indigo-600" :
                    progress < 100 ? "h-4 w-4 text-amber-600" :
                    "h-4 w-4 text-green-600"
                  } />
                  <AlertTitle>
                    {progress < 33 ? "Ride Initiating" :
                     progress < 66 ? "Driver Arrived" :
                     progress < 100 ? "Journey in Progress" :
                     "Journey Complete"}
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    {progress < 33 ? "Your driver is on the way. We're analyzing traffic patterns to optimize arrival time." :
                     progress < 66 ? "Your driver has arrived. We've selected an optimal route based on current conditions." :
                     progress < 100 ? `You're ${Math.ceil((100 - progress) / 5)} minutes from your destination. Journey progressing efficiently.` :
                     "You've reached your destination. This ride was more efficient than 78% of similar routes."}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                <h3 className="font-medium">Analytics Unavailable</h3>
                <p className="text-sm text-gray-500 mt-1">
                  We couldn't load analytics for this ride.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      getRideEfficiencyAnalysis(pickup, destination, rideType, fareAmount)
                        .then(data => {
                          setEfficiencyData(data);
                          setIsLoading(false);
                        })
                        .catch(error => {
                          console.error(error);
                          setIsLoading(false);
                        });
                    }, 1000);
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Smart Tips Tab */}
          <TabsContent value="tips">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-16 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-16 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-16 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
            ) : travelTips.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Personalized travel tips based on your ride patterns and preferences:
                </p>
                
                {travelTips.map((tip, index) => (
                  <div key={index} className="border rounded-md p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        {getTipIcon(tip.category)}
                        <span>{tip.title}</span>
                      </h4>
                      <Badge className={getTipBadgeStyle(tip.category)}>
                        {tip.category}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600">{tip.description}</p>
                    
                    {tip.actionable && tip.action && (
                      <div className="pt-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-7 gap-1"
                          onClick={() => toast.success(`Tip applied: ${tip.title}`)}
                        >
                          <BadgePercent className="h-3 w-3" />
                          <span>{tip.action}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="mt-2 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        getSmartTravelTips([], { 
                          ecoFriendly: rideType === "green", 
                          costSensitive: rideType === "carpool" || rideType === "standard",
                          comfortPreferred: rideType === "premium"
                        })
                        .then(data => {
                          setTravelTips(data);
                          setIsLoading(false);
                          toast.success("Found new travel tips for you!");
                        })
                        .catch(error => {
                          console.error(error);
                          setIsLoading(false);
                        });
                      }, 1000);
                    }}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    <span>Refresh Tips</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                <h3 className="font-medium">Tips Unavailable</h3>
                <p className="text-sm text-gray-500 mt-1">
                  We couldn't load personalized tips for your ride pattern.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      getSmartTravelTips([], { 
                        ecoFriendly: rideType === "green", 
                        costSensitive: rideType === "carpool" || rideType === "standard",
                        comfortPreferred: rideType === "premium"
                      })
                      .then(data => {
                        setTravelTips(data);
                        setIsLoading(false);
                      })
                      .catch(error => {
                        console.error(error);
                        setIsLoading(false);
                      });
                    }, 1000);
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 