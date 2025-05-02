"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Cloud, Map, MapPin, Clock, Zap, Umbrella, Navigation, AlertTriangle, Info } from 'lucide-react';
import { Location } from '@/lib/types';
import { 
  RouteEstimate, 
  WeatherInsight, 
  RouteInsights, 
  RideSuggestion,
  getWeatherInsights,
  getRouteInsights,
  getPersonalizedRideSuggestions
} from '@/lib/gemini-service';

interface SmartInsightsCardProps {
  pickup: Location | null;
  destination: Location | null;
  routeInfo: RouteEstimate | null;
  isLoading?: boolean;
  userPreferences?: {
    ecoFriendly?: boolean;
    costSensitive?: boolean;
    comfortPreferred?: boolean;
  };
  onRideTypeSelected?: (rideType: string) => void;
}

export function SmartInsightsCard({ 
  pickup, 
  destination, 
  routeInfo, 
  isLoading = false,
  userPreferences,
  onRideTypeSelected 
}: SmartInsightsCardProps) {
  const [activeTab, setActiveTab] = useState('weather');
  const [weather, setWeather] = useState<WeatherInsight | null>(null);
  const [insights, setInsights] = useState<RouteInsights | null>(null);
  const [suggestions, setSuggestions] = useState<RideSuggestion[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Fetch insights when route info is available
  useEffect(() => {
    if (pickup && destination && routeInfo) {
      fetchInsights();
    }
  }, [pickup, destination, routeInfo]);

  // Function to fetch all insights
  const fetchInsights = async () => {
    if (!pickup || !destination || !routeInfo) return;
    
    setIsLoadingInsights(true);
    
    try {
      // Fetch weather, route insights, and ride suggestions in parallel
      const [weatherData, routeInsightsData, rideSuggestionsData] = await Promise.all([
        getWeatherInsights(pickup, destination),
        getRouteInsights(pickup, destination),
        getPersonalizedRideSuggestions(pickup, destination, routeInfo, userPreferences)
      ]);
      
      setWeather(weatherData);
      setInsights(routeInsightsData);
      setSuggestions(rideSuggestionsData);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Function to handle selecting a ride type from suggestions
  const handleSelectRideType = (rideType: string) => {
    if (onRideTypeSelected) {
      onRideTypeSelected(rideType);
    }
  };

  // If loading or missing required data
  if (isLoading || isLoadingInsights || !pickup || !destination || !routeInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Insights</CardTitle>
          <CardDescription>AI-powered travel information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600" />
          <span>Smart Insights</span>
        </CardTitle>
        <CardDescription>
          AI-powered insights for your journey from {pickup.name || pickup.address.split(',')[0]} to {destination.name || destination.address.split(',')[0]}
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 py-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="weather" className="flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              <span>Weather</span>
            </TabsTrigger>
            <TabsTrigger value="route" className="flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              <span>Route</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              <span>Suggestions</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-2 pb-4">
          {/* Weather tab content */}
          <TabsContent value="weather" className="space-y-3 mt-0">
            {weather && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">{weather.condition}</span>
                  </div>
                  <span>{weather.temperature}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Umbrella className="h-4 w-4" />
                  <span>{weather.precipitation}</span>
                </div>
                
                <Alert className="mt-3 bg-blue-50 border-blue-200">
                  <AlertTitle className="text-blue-700 text-sm font-medium flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Weather Advisory
                  </AlertTitle>
                  <AlertDescription className="text-blue-700 text-xs">
                    {weather.recommendation}
                  </AlertDescription>
                </Alert>
              </>
            )}
          </TabsContent>
          
          {/* Route tab content */}
          <TabsContent value="route" className="space-y-4 mt-0">
            {insights && (
              <>
                {/* Landmarks section */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Notable Landmarks</h4>
                  <div className="space-y-2">
                    {insights.landmarks.map((landmark, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                        <span>{landmark}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Traffic alerts */}
                {insights.trafficAlerts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Traffic Alerts</h4>
                    {insights.trafficAlerts.map((alert, index) => (
                      <Alert key={index} className="mb-2 py-2 bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-700 text-xs font-medium ml-2">
                          {alert}
                        </AlertTitle>
                      </Alert>
                    ))}
                  </div>
                )}
                
                {/* Alternative route */}
                {insights.alternativeRoute && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                      <Map className="h-4 w-4 text-indigo-600" />
                      <span>Alternative Route</span>
                    </h4>
                    <p className="text-sm">{insights.alternativeRoute.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        {insights.alternativeRoute.timeDifference}
                      </span>
                      <span>
                        {insights.alternativeRoute.distanceDifference}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Suggestions tab content */}
          <TabsContent value="suggestions" className="space-y-3 mt-0">
            <div className="text-sm text-gray-600 mb-2">
              Based on your route and preferences, we recommend:
            </div>
            
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-3 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                onClick={() => handleSelectRideType(suggestion.type)}
              >
                <div className="flex justify-between items-start">
                  <Badge className={`
                    ${suggestion.type === 'green' ? 'bg-green-100 text-green-800' : ''}
                    ${suggestion.type === 'premium' ? 'bg-purple-100 text-purple-800' : ''}
                    ${suggestion.type === 'standard' ? 'bg-blue-100 text-blue-800' : ''}
                    ${suggestion.type === 'carpool' ? 'bg-amber-100 text-amber-800' : ''}
                  `}>
                    {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                  </Badge>
                </div>
                <div className="mt-2 text-sm font-medium">{suggestion.reason}</div>
                <div className="mt-1 text-xs text-gray-600">{suggestion.benefitDescription}</div>
              </div>
            ))}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="bg-gray-50 border-t px-6 py-3">
        <div className="text-xs text-gray-500 flex items-center gap-1 w-full justify-center">
          <Zap className="h-3 w-3" />
          <span>Powered by Gemini AI</span>
        </div>
      </CardFooter>
    </Card>
  );
} 