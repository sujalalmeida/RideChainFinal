"use client"

import { GoogleMaps } from "./google-maps"
import { Location } from "@/lib/types"
import { useEffect } from "react"

interface EnhancedMapProps {
  onPickupSelect?: (location: Location) => void
  onDestinationSelect?: (location: Location) => void
  pickup?: string | Location | null
  destination?: string | Location | null
  showRoute?: boolean
  showDriver?: boolean
  driverLocation?: Location
  currentStep?: number
  className?: string
  onRouteInfoUpdate?: (routeInfo: any) => void
}

export function EnhancedMap(props: EnhancedMapProps) {
  // Convert string pickup/destination to null as GoogleMaps expects Location objects
  const adjustedProps = {
    ...props,
    pickup: typeof props.pickup === 'string' ? null : props.pickup,
    destination: typeof props.destination === 'string' ? null : props.destination
  };
  
  // Listen for route information updates from the GoogleMaps component
  useEffect(() => {
    const handleRouteCalculated = (event: CustomEvent<any>) => {
      // Forward the event to any parent component that needs it
      if (props.onRouteInfoUpdate) {
        props.onRouteInfoUpdate(event.detail);
      }
      
      console.log("EnhancedMap received route information:", event.detail);
    };
    
    window.addEventListener('route-calculated', handleRouteCalculated as EventListener);
    
    return () => {
      window.removeEventListener('route-calculated', handleRouteCalculated as EventListener);
    };
  }, [props.onRouteInfoUpdate]);
  
  return <GoogleMaps {...adjustedProps} />
}

