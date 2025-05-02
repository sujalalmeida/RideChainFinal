"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, Ruler, Route, Leaf, AlertCircle } from 'lucide-react';
import { Location } from '@/lib/types';
import { RouteEstimate } from '@/lib/gemini-service';
import { EnhancedMap } from '@/components/interactive-map/enhanced-map';

interface RouteVisualizationProps {
  pickup: Location | null;
  destination: Location | null;
  routeInfo: RouteEstimate | null;
  isLoading?: boolean;
  onRouteInfoUpdate?: (routeInfo: Partial<RouteEstimate>) => void;
}

interface GoogleRouteInfo {
  distance: string;
  distanceValue: number; // in meters
  duration: string;
  durationValue: number; // in seconds
  startLocation: {lat: number, lng: number};
  endLocation: {lat: number, lng: number};
  steps: any[]; // Using any for DirectionsStep to avoid Google Maps namespace dependency
}

export function RouteVisualization({ 
  pickup, 
  destination, 
  routeInfo: initialRouteInfo, 
  isLoading: isLoadingProp = false,
  onRouteInfoUpdate
}: RouteVisualizationProps) {
  const [isLoading, setIsLoading] = useState(isLoadingProp);
  const [actualRouteInfo, setActualRouteInfo] = useState<RouteEstimate | null>(initialRouteInfo);
  const [googleRouteInfo, setGoogleRouteInfo] = useState<GoogleRouteInfo | null>(null);
  const [mapError, setMapError] = useState(false);
  
  // Helper function to format locations for display
  const formatLocationName = (location: Location | null): string => {
    if (!location) return '';
    return location.name || location.address?.split(',')[0] || '';
  };

  // Listen for route calculation events from Google Maps
  useEffect(() => {
    const handleRouteCalculated = (event: Event) => {
      const routeEvent = event as CustomEvent<GoogleRouteInfo>;
      const routeData = routeEvent.detail;
      
      console.log("Route data received from Google Maps:", routeData);
      setGoogleRouteInfo(routeData);
      
      // Calculate carbon footprint based on distance (rough estimate: 120g CO2 per km for average car)
      const distanceInKm = routeData.distanceValue / 1000;
      const carbonFootprint = distanceInKm * 0.12; // 0.12 kg CO2 per km
      
      // Determine traffic level based on expected vs actual duration
      // This is a simple heuristic - in real apps, you'd use Google's traffic data
      const expectedDuration = distanceInKm * 1.5 * 60; // Expected seconds at 40 km/h
      const actualDuration = routeData.durationValue;
      let trafficLevel: 'low' | 'medium' | 'high' = 'low';
      
      if (actualDuration > expectedDuration * 1.5) {
        trafficLevel = 'high';
      } else if (actualDuration > expectedDuration * 1.2) {
        trafficLevel = 'medium';
      }
      
      // Create updated route info
      const updatedRouteInfo: RouteEstimate = {
        distance: routeData.distance,
        duration: routeData.duration,
        carbonFootprint,
        trafficLevel
      };
      
      setActualRouteInfo(updatedRouteInfo);
      
      // Notify parent component
      if (onRouteInfoUpdate) {
        onRouteInfoUpdate(updatedRouteInfo);
      }
      
      setIsLoading(false);
    };
    
    const handleMapError = () => {
      setMapError(true);
      setIsLoading(false);
    };
    
    window.addEventListener('route-calculated', handleRouteCalculated);
    window.addEventListener('google-maps-error', handleMapError);
    
    return () => {
      window.removeEventListener('route-calculated', handleRouteCalculated);
      window.removeEventListener('google-maps-error', handleMapError);
    };
  }, [onRouteInfoUpdate]);
  
  // Update loading state when props change
  useEffect(() => {
    if (pickup && destination && !googleRouteInfo) {
      setIsLoading(true);
    }
    
    // Update route info when props change but keep Google data if available
    if (initialRouteInfo && (!actualRouteInfo || !googleRouteInfo)) {
      setActualRouteInfo(initialRouteInfo);
    }
  }, [pickup, destination, initialRouteInfo, actualRouteInfo, googleRouteInfo]);

  // Determine traffic level styling based on level
  const getTrafficBadge = () => {
    if (!actualRouteInfo) return null;

    const level = actualRouteInfo.trafficLevel;
    const colorMap = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-amber-100 text-amber-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`${colorMap[level]} capitalize`}>
        {level} traffic
      </Badge>
    );
  };

  const renderRouteInfo = () => {
    // If no locations are selected yet
    if (!pickup || !destination) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 flex-1 text-center py-8">
          <Route className="h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">
            Enter pickup and destination locations to see route details
          </p>
        </div>
      );
    }
    
    // If there's a map error
    if (mapError) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 flex-1 text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-300" />
          <p className="text-sm text-red-500">
            Unable to calculate route. Please try again or select different locations.
          </p>
        </div>
      );
    }
    
    // If we have locations but no route info yet, show loading
    if (isLoading || !actualRouteInfo) {
      return (
        <div className="space-y-4 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }
    
    // If we have everything, show the route info
    return (
      <>
        {/* Map Visualization */}
        <div className="mb-6 h-64 w-full rounded-lg overflow-hidden border border-gray-200 map-container">
          <EnhancedMap 
            pickup={pickup}
            destination={destination}
            showRoute={true}
            className="h-full w-full"
          />
        </div>

        {/* Journey visualization */}
        <div className="mb-6 relative">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center z-10 relative">
                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
              </div>
              <div className="absolute top-8 bottom-8 left-4 w-0.5 bg-indigo-200 z-0"></div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-16 z-10 relative">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
              </div>
            </div>
            <div className="space-y-16">
              <div>
                <p className="font-medium">{formatLocationName(pickup)}</p>
                <p className="text-sm text-gray-500 truncate max-w-[250px]">{pickup.address}</p>
              </div>
              <div>
                <p className="font-medium">{formatLocationName(destination)}</p>
                <p className="text-sm text-gray-500 truncate max-w-[250px]">{destination.address}</p>
              </div>
            </div>
          </div>

          {/* Animated car on the path */}
          <div className="absolute left-4 top-10 transform -translate-x-1/2 z-20 animate-car">
            <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center rotate-90">
              <Route className="h-3 w-3 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Route details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Distance</span>
            </div>
            <span className="text-sm">{actualRouteInfo.distance}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Travel Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{actualRouteInfo.duration}</span>
              {getTrafficBadge()}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Carbon Footprint</span>
            </div>
            <span className="text-sm">{actualRouteInfo.carbonFootprint.toFixed(1)} kg CO2</span>
          </div>
        </div>
        
        {/* Recommendations based on traffic */}
        {actualRouteInfo.trafficLevel === 'high' && (
          <div className="mt-4 bg-red-50 text-red-800 p-3 rounded-md text-sm">
            <p className="font-medium">Traffic Alert</p>
            <p>Heavy traffic detected on this route. Consider traveling at a different time if possible.</p>
          </div>
        )}
      </>
    );
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <h3 className="text-lg font-medium mb-4">Route Information</h3>
        {renderRouteInfo()}
      </CardContent>
    </Card>
  );
}

// Add this style to your global CSS
export const styles = `
  @keyframes drive {
    0% {
      top: 10%;
    }
    100% {
      top: 80%;
    }
  }
  
  .animate-car {
    animation: drive 3s infinite;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
`; 