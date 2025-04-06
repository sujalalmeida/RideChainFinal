"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Navigation, LocateFixed, Zap } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Location {
  lat: number
  lng: number
  address?: string
}

interface InteractiveMapProps {
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

export function InteractiveMap({
  onPickupSelect,
  onDestinationSelect,
  pickup,
  destination,
  showRoute = false,
  showDriver = false,
  driverLocation,
  currentStep = 1,
  className,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [selectionMode, setSelectionMode] = useState<"pickup" | "destination" | null>(null)
  const [pickupMarker, setPickupMarker] = useState<Location | null>(null)
  const [destinationMarker, setDestinationMarker] = useState<Location | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)
  const [mapZoom, setMapZoom] = useState(14)
  const [showTraffic, setShowTraffic] = useState(false)
  const [showPOI, setShowPOI] = useState(false)

  // Mock locations for demo
  const mockLocations = [
    { name: "Downtown", lat: 37.7749, lng: -122.4194 },
    { name: "Airport", lat: 37.6213, lng: -122.379 },
    { name: "Shopping Mall", lat: 37.7833, lng: -122.4167 },
    { name: "Tech Park", lat: 37.7937, lng: -122.3965 },
    { name: "University", lat: 37.8044, lng: -122.2711 },
  ]

  // Simulate map loading
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  // Handle map click for location selection
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectionMode) return

    // Get click coordinates relative to the map container
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert to "lat/lng" (this is a mock implementation)
    // In a real app, you would use the map API's methods to convert screen coordinates to geo coordinates
    const lat = 37.7749 + (y - rect.height / 2) * 0.001
    const lng = -122.4194 + (x - rect.width / 2) * 0.001

    // Find closest mock location for demo purposes
    const closestLocation = findClosestLocation(lat, lng)

    if (selectionMode === "pickup") {
      setPickupMarker(closestLocation)
      if (onPickupSelect) {
        onPickupSelect(closestLocation)
      }
    } else {
      setDestinationMarker(closestLocation)
      if (onDestinationSelect) {
        onDestinationSelect(closestLocation)
      }
    }

    // If both markers are set, calculate route
    if ((selectionMode === "pickup" && destinationMarker) || (selectionMode === "destination" && pickupMarker)) {
      calculateRoute()
    }

    setSelectionMode(null)
  }

  // Find closest mock location for demo
  const findClosestLocation = (lat: number, lng: number) => {
    let closest = mockLocations[0]
    let minDist = Number.MAX_VALUE

    mockLocations.forEach((loc) => {
      const dist = Math.sqrt(Math.pow(lat - loc.lat, 2) + Math.pow(lng - loc.lng, 2))
      if (dist < minDist) {
        minDist = dist
        closest = loc
      }
    })

    return {
      lat: closest.lat,
      lng: closest.lng,
      address: closest.name,
    }
  }

  // Calculate route between markers
  const calculateRoute = () => {
    if (!pickupMarker || !destinationMarker) return

    // In a real app, you would call a routing API
    // For demo, we'll just set some mock data
    const distance =
      Math.sqrt(
        Math.pow(pickupMarker.lat - destinationMarker.lat, 2) + Math.pow(pickupMarker.lng - destinationMarker.lng, 2),
      ) * 111 // rough km per degree at equator

    setRouteInfo({
      distance: `${distance.toFixed(1)} km`,
      duration: `${Math.ceil(distance * 3)} min`, // assume 20 km/h average speed
    })
  }

  // Use browser geolocation to set pickup
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Location",
          }
          setPickupMarker(location)
          if (onPickupSelect) {
            onPickupSelect(location)
          }
          if (destinationMarker) {
            calculateRoute()
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          // Fall back to a default location
          const defaultLocation = {
            lat: 37.7749,
            lng: -122.4194,
            address: "Default Location",
          }
          setPickupMarker(defaultLocation)
          if (onPickupSelect) {
            onPickupSelect(defaultLocation)
          }
        },
      )
    }
  }

  return (
    <div className={`relative w-full h-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Map controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" className="bg-white shadow-md" onClick={useCurrentLocation}>
                    <LocateFixed className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Use current location</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showTraffic ? "default" : "secondary"}
                    size="icon"
                    className={showTraffic ? "bg-indigo-600" : "bg-white shadow-md"}
                    onClick={() => setShowTraffic(!showTraffic)}
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show traffic</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Card className="p-2 bg-white shadow-md">
              <Slider
                defaultValue={[mapZoom]}
                max={20}
                min={10}
                step={1}
                onValueChange={(value) => setMapZoom(value[0])}
                className="w-24"
              />
            </Card>
          </div>

          {/* Location selection buttons */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <Button
              variant={selectionMode === "pickup" ? "default" : "secondary"}
              className={selectionMode === "pickup" ? "bg-indigo-600" : "bg-white shadow-md"}
              onClick={() => setSelectionMode("pickup")}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Set Pickup
            </Button>
            <Button
              variant={selectionMode === "destination" ? "default" : "secondary"}
              className={selectionMode === "destination" ? "bg-indigo-600" : "bg-white shadow-md"}
              onClick={() => setSelectionMode("destination")}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Set Destination
            </Button>
          </div>

          {/* Route information */}
          {routeInfo && showRoute && (
            <div className="absolute bottom-4 left-4 z-10">
              <Card className="p-3 bg-white shadow-md">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium">Distance</p>
                    <p className="text-lg font-bold">{routeInfo.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-lg font-bold">{routeInfo.duration}</p>
                  </div>
                  {showTraffic && <Badge className="bg-yellow-500">Moderate Traffic</Badge>}
                </div>
              </Card>
            </div>
          )}

          {/* Selection mode indicator */}
          {selectionMode && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Badge className="bg-indigo-600 px-3 py-1 text-sm">
                Click on the map to select {selectionMode === "pickup" ? "pickup" : "destination"} location
              </Badge>
            </div>
          )}

          {/* Map background */}
          <div
            className="absolute inset-0 bg-[#e8ecef]"
            ref={mapRef}
            onClick={handleMapClick}
            style={{ cursor: selectionMode ? "crosshair" : "default" }}
          >
            {/* Grid lines to simulate a map */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #d1d5db 1px, transparent 1px), linear-gradient(to bottom, #d1d5db 1px, transparent 1px)",
                backgroundSize: `${(20 * mapZoom) / 14}px ${(20 * mapZoom) / 14}px`,
              }}
            ></div>

            {/* Mock roads */}
            <div className="absolute left-0 right-0 top-1/2 h-4 bg-gray-300 transform -translate-y-1/2"></div>
            <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-gray-300 transform -translate-x-1/2"></div>
            <div className="absolute top-0 bottom-0 left-2/3 w-4 bg-gray-300 transform -translate-x-1/2"></div>

            {/* Traffic visualization */}
            {showTraffic && (
              <>
                <div className="absolute left-1/3 right-0 top-1/2 h-4 bg-yellow-400 opacity-50 transform -translate-y-1/2"></div>
                <div className="absolute top-1/3 bottom-0 left-2/3 w-4 bg-red-400 opacity-50 transform -translate-x-1/2"></div>
              </>
            )}

            {/* Points of interest */}
            {showPOI ||
              (true &&
                mockLocations.map((loc, index) => (
                  <div
                    key={index}
                    className="absolute w-2 h-2 bg-gray-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      top: `${50 + (loc.lat - 37.7749) * 1000}%`,
                      left: `${50 + (loc.lng - -122.4194) * 1000}%`,
                    }}
                  >
                    <div className="absolute -top-6 -left-10 w-20 text-xs text-center">{loc.name}</div>
                  </div>
                )))}

            {/* Route line if showing route */}
            {showRoute && pickupMarker && destinationMarker && (
              <div
                className="absolute h-2 bg-indigo-500 rounded-full"
                style={{
                  top: `${50 + (pickupMarker.lat - 37.7749) * 500 + ((destinationMarker.lat - pickupMarker.lat) / 2) * 500}%`,
                  left: `${50 + (pickupMarker.lng - -122.4194) * 500}%`,
                  width: `${Math.abs(destinationMarker.lng - pickupMarker.lng) * 500}%`,
                  transform: "translate(-50%, -50%) rotate(45deg)",
                  transformOrigin: "center",
                }}
              ></div>
            )}

            {/* Pickup location */}
            {pickupMarker && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${50 + (pickupMarker.lat - 37.7749) * 1000}%`,
                  left: `${50 + (pickupMarker.lng - -122.4194) * 1000}%`,
                }}
              >
                <div className="relative">
                  <div className="absolute -top-8 -left-16 w-32">
                    <Card className="p-1 text-xs text-center shadow-lg">
                      <div className="font-medium">{pickupMarker.address || "Pickup"}</div>
                    </Card>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Destination location */}
            {destinationMarker && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${50 + (destinationMarker.lat - 37.7749) * 1000}%`,
                  left: `${50 + (destinationMarker.lng - -122.4194) * 1000}%`,
                }}
              >
                <div className="relative">
                  <div className="absolute -top-8 -left-16 w-32">
                    <Card className="p-1 text-xs text-center shadow-lg">
                      <div className="font-medium">{destinationMarker.address || "Destination"}</div>
                    </Card>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Navigation className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Driver location */}
            {showDriver && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
                style={{
                  top:
                    currentStep === 2
                      ? "45%"
                      : currentStep === 3
                        ? `${50 + (pickupMarker?.lat || 37.7749 - 37.7749) * 1000}%`
                        : currentStep === 4
                          ? `${50 + ((pickupMarker?.lat || 37.7749) + (destinationMarker?.lat || 37.7749)) / 2 - 37.7749 * 1000}%`
                          : `${50 + (destinationMarker?.lat || 37.7749 - 37.7749) * 1000}%`,
                  left:
                    currentStep === 2
                      ? "40%"
                      : currentStep === 3
                        ? `${50 + (pickupMarker?.lng || -122.4194 - -122.4194) * 1000}%`
                        : currentStep === 4
                          ? `${50 + ((pickupMarker?.lng || -122.4194) + (destinationMarker?.lng || -122.4194)) / 2 - (-122.4194) * 1000}%`
                          : `${50 + (destinationMarker?.lng || -122.4194 - -122.4194) * 1000}%`,
                }}
              >
                <div className="relative">
                  <div className="absolute -top-8 -left-16 w-32">
                    <Card className="p-1 text-xs text-center shadow-lg bg-indigo-600 text-white">
                      <div className="font-medium">Your Driver</div>
                    </Card>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
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
                      className="text-white"
                    >
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"></path>
                      <circle cx="7" cy="17" r="2"></circle>
                      <path d="M9 17h6"></path>
                      <circle cx="17" cy="17" r="2"></circle>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

