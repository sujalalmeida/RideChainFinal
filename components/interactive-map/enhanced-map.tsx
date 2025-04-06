"use client"

import { OpenLayersMap } from "./open-layers-map"
import { Location } from "@/lib/types"

interface EnhancedMapProps {
  onPickupSelect?: (location: Location) => void
  onDestinationSelect?: (location: Location) => void
  pickup?: string | Location
  destination?: string | Location
  showRoute?: boolean
  showDriver?: boolean
  driverLocation?: Location
  currentStep?: number
  className?: string
}

export function EnhancedMap(props: EnhancedMapProps) {
  return <OpenLayersMap {...props} />
}

