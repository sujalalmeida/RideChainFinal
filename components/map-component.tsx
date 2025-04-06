"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Car, MapPin, Navigation } from "lucide-react"

interface MapComponentProps {
  pickup?: string
  destination?: string
  showRoute?: boolean
  showDriver?: boolean
  driverLocation?: { lat: number; lng: number }
  currentStep?: number
}

export function MapComponent({
  pickup,
  destination,
  showRoute = false,
  showDriver = false,
  driverLocation,
  currentStep = 1,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  // This is a mock implementation - in a real app, you would use a mapping library like Leaflet or Google Maps
  useEffect(() => {
    if (mapRef.current) {
      // Simulate map loading
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden" ref={mapRef}>
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Mock map background */}
          <div className="absolute inset-0 bg-[#e8ecef]">
            {/* Grid lines to simulate a map */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #d1d5db 1px, transparent 1px), linear-gradient(to bottom, #d1d5db 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* Mock roads */}
            <div className="absolute left-0 right-0 top-1/2 h-4 bg-gray-300 transform -translate-y-1/2"></div>
            <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-gray-300 transform -translate-x-1/2"></div>
            <div className="absolute top-0 bottom-0 left-2/3 w-4 bg-gray-300 transform -translate-x-1/2"></div>

            {/* Route line if showing route */}
            {showRoute && (
              <div className="absolute top-1/2 left-1/4 right-1/4 h-2 bg-indigo-500 transform -translate-y-1/2 rounded-full"></div>
            )}

            {/* Pickup location */}
            {pickup && (
              <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute -top-8 -left-16 w-32">
                    <Card className="p-1 text-xs text-center shadow-lg">
                      <div className="font-medium">Pickup</div>
                    </Card>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Destination location */}
            {destination && (
              <div className="absolute top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute -top-8 -left-16 w-32">
                    <Card className="p-1 text-xs text-center shadow-lg">
                      <div className="font-medium">Destination</div>
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
                  top: "50%",
                  left: currentStep === 2 ? "20%" : currentStep === 3 ? "25%" : currentStep === 4 ? "50%" : "75%",
                }}
              >
                <div className="relative">
                  <div className="absolute -top-8 -left-16 w-32">
                    <Card className="p-1 text-xs text-center shadow-lg bg-indigo-600 text-white">
                      <div className="font-medium">Your Driver</div>
                    </Card>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
                    <Car className="h-5 w-5 text-white" />
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

