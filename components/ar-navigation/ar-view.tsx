"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Coffee, FuelIcon as GasPump } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// This would be set via environment variables in a real app
mapboxgl.accessToken = "pk.eyJ1IjoicmlkZWNoYWluIiwiYSI6ImNsbjRtYTB3eTBpNXQycW1uZzBzNnRwMWsifQ.3fMlEZR_q9vZYFghfbzqmw"

interface ARViewProps {
  currentRide?: any
  showFullAR?: boolean
  onClose?: () => void
}

export function ARView({ currentRide, showFullAR = false, onClose }: ARViewProps) {
  const { user } = useAppContext()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [arEnabled, setArEnabled] = useState(false)
  const [poiVisible, setPoiVisible] = useState(true)
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [direction, setDirection] = useState<number>(0)
  const [pointsOfInterest, setPointsOfInterest] = useState<any[]>([])
  const [navigationInstructions, setNavigationInstructions] = useState<string>("Proceed to the route")
  const [nextTurn, setNextTurn] = useState<string | null>(null)
  const [distance, setDistance] = useState<string | null>(null)

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Create the map instance
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-122.4194, 37.7749], // Default to San Francisco
      zoom: 14,
      pitch: 60, // Tilted view for better 3D perspective
      bearing: 0,
      antialias: true,
    })

    // Add navigation control
    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Add geolocate control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
    mapInstance.addControl(geolocateControl)

    // When map loads
    mapInstance.on("load", () => {
      // Add 3D buildings for AR-like experience
      mapInstance.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
          "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
          "fill-extrusion-opacity": 0.6,
        },
      })

      // Trigger geolocate to get user's position
      geolocateControl.trigger()

      // Listen for position updates
      geolocateControl.on("geolocate", (e: any) => {
        const { longitude, latitude } = e.coords
        setUserLocation([longitude, latitude])

        // Fetch nearby points of interest
        fetchNearbyPOI(longitude, latitude)

        // If we have a destination, calculate route
        if (currentRide?.to) {
          calculateRoute(
            [longitude, latitude],
            typeof currentRide.to === "string"
              ? [-122.4314, 37.7837] // Default destination if string
              : [currentRide.to.lng, currentRide.to.lat],
          )
        }
      })
    })

    setMap(mapInstance)

    return () => {
      mapInstance.remove()
    }
  }, [])

  // Initialize AR view
  useEffect(() => {
    if (!showFullAR) return

    const initCamera = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        videoRef.current.srcObject = stream
        videoRef.current.play()

        // Initialize device orientation for AR
        if (window.DeviceOrientationEvent) {
          window.addEventListener("deviceorientation", handleOrientation)
        }

        setArEnabled(true)
      } catch (error) {
        console.error("Error accessing camera:", error)
      }
    }

    if (showFullAR) {
      initCamera()
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation)
      }
    }
  }, [showFullAR])

  // Draw AR overlays on canvas
  useEffect(() => {
    if (!arEnabled || !canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const drawAROverlays = () => {
      // Set canvas dimensions to match video
      canvas.width = videoRef.current?.videoWidth || window.innerWidth
      canvas.height = videoRef.current?.videoHeight || window.innerHeight

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw direction arrow
      drawDirectionArrow(ctx, canvas.width, canvas.height)

      // Draw points of interest if enabled
      if (poiVisible && pointsOfInterest.length > 0) {
        drawPointsOfInterest(ctx, canvas.width, canvas.height)
      }

      // Draw navigation instructions
      drawNavigationInstructions(ctx, canvas.width, canvas.height)

      // Continue animation
      requestAnimationFrame(drawAROverlays)
    }

    const animationId = requestAnimationFrame(drawAROverlays)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [arEnabled, direction, pointsOfInterest, poiVisible, navigationInstructions, nextTurn, distance])

  // Handle device orientation for AR
  const handleOrientation = (event: DeviceOrientationEvent) => {
    // Alpha is the compass direction the device is facing
    if (event.alpha !== null) {
      setDirection(event.alpha)
    }
  }

  // Fetch nearby points of interest
  const fetchNearbyPOI = async (longitude: number, latitude: number) => {
    try {
      // In a real app, this would be an API call to Mapbox or similar service
      // For demo purposes, we'll use mock data based on the real location

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock POIs that would come from a real API
      const mockPOIs = [
        {
          id: "poi-1",
          name: "Coffee Shop",
          type: "cafe",
          icon: Coffee,
          location: [longitude + 0.002, latitude + 0.001],
          distance: "200m",
        },
        {
          id: "poi-2",
          name: "Gas Station",
          type: "gas",
          icon: GasPump,
          location: [longitude - 0.001, latitude + 0.002],
          distance: "350m",
        },
        {
          id: "poi-3",
          name: "Traffic Alert",
          type: "alert",
          icon: AlertTriangle,
          location: [longitude + 0.003, latitude - 0.001],
          distance: "500m",
          alert: "Heavy traffic ahead",
        },
      ]

      setPointsOfInterest(mockPOIs)

      // Add POIs to map
      if (map) {
        // Remove existing markers first
        const existingMarkers = document.querySelectorAll(".mapboxgl-marker")
        existingMarkers.forEach((marker) => marker.remove())

        // Add new markers
        mockPOIs.forEach((poi) => {
          const el = document.createElement("div")
          el.className = "poi-marker"
          el.style.width = "24px"
          el.style.height = "24px"
          el.style.borderRadius = "50%"
          el.style.backgroundColor = poi.type === "alert" ? "#ef4444" : "#4f46e5"
          el.style.display = "flex"
          el.style.alignItems = "center"
          el.style.justifyContent = "center"
          el.style.color = "white"
          el.style.fontSize = "12px"
          el.innerHTML = poi.type === "cafe" ? "☕" : poi.type === "gas" ? "⛽" : "⚠️"

          new mapboxgl.Marker(el).setLngLat(poi.location as [number, number]).addTo(map)
        })
      }
    } catch (error) {
      console.error("Error fetching POIs:", error)
    }
  }

  // Calculate route between two points
  const calculateRoute = async (start: [number, number], end: [number, number]) => {
    try {
      // In a real app, this would be an API call to Mapbox Directions API
      // For demo purposes, we'll simulate the response

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!map) return

      // Remove existing route
      if (map.getSource("route")) {
        map.removeLayer("route")
        map.removeSource("route")
      }

      // Add route to map
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              start,
              [start[0] + 0.01, start[1] + 0.005],
              [start[0] + 0.02, start[1] + 0.001],
              [end[0] - 0.005, end[1] - 0.002],
              end,
            ],
          },
        },
      })

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#4f46e5",
          "line-width": 8,
          "line-opacity": 0.8,
        },
      })

      // Set navigation instructions
      setNavigationInstructions("Continue straight for 0.5 miles")
      setNextTurn("Turn right onto Market Street")
      setDistance("2.3 miles")

      // Fit bounds to show the entire route
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend(start)
      bounds.extend(end)

      map.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
      })
    } catch (error) {
      console.error("Error calculating route:", error)
    }
  }

  // Draw direction arrow on canvas
  const drawDirectionArrow = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 4
    const arrowLength = 60

    // Calculate arrow endpoint based on direction
    const radians = (direction * Math.PI) / 180
    const endX = centerX + arrowLength * Math.sin(radians)
    const endY = centerY - arrowLength * Math.cos(radians)

    // Draw arrow
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(endX, endY)
    ctx.lineWidth = 5
    ctx.strokeStyle = "#4f46e5"
    ctx.stroke()

    // Draw arrowhead
    const headLength = 15
    const angle = Math.atan2(endY - centerY, endX - centerX)

    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6))
    ctx.lineTo(endX, endY)
    ctx.fillStyle = "#4f46e5"
    ctx.fill()
  }

  // Draw points of interest on canvas
  const drawPointsOfInterest = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    pointsOfInterest.forEach((poi, index) => {
      // In a real app, we would calculate the position based on the device's
      // orientation and the POI's geolocation relative to the user
      // For demo purposes, we'll place them at fixed positions

      const x = 100 + index * 150
      const y = height / 2

      // Draw POI marker
      ctx.beginPath()
      ctx.arc(x, y, 25, 0, 2 * Math.PI)
      ctx.fillStyle = poi.type === "alert" ? "rgba(239, 68, 68, 0.8)" : "rgba(79, 70, 229, 0.8)"
      ctx.fill()

      // Draw POI icon (simplified)
      ctx.fillStyle = "white"
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(poi.type === "cafe" ? "☕" : poi.type === "gas" ? "⛽" : "⚠️", x, y)

      // Draw POI name
      ctx.fillStyle = "white"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(poi.name, x, y + 40)

      // Draw POI distance
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = "12px Arial"
      ctx.fillText(poi.distance, x, y + 60)
    })
  }

  // Draw navigation instructions on canvas
  const drawNavigationInstructions = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw instruction panel background
    const panelHeight = 100
    const panelY = height - panelHeight - 20

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.roundRect(20, panelY, width - 40, panelHeight, 10)
    ctx.fill()

    // Draw current instruction
    ctx.fillStyle = "white"
    ctx.font = "18px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(navigationInstructions, width / 2, panelY + 30)

    // Draw next turn if available
    if (nextTurn) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = "14px Arial"
      ctx.fillText(`Next: ${nextTurn}`, width / 2, panelY + 60)
    }

    // Draw distance to destination
    if (distance) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = "14px Arial"
      ctx.fillText(`Distance: ${distance}`, width / 2, panelY + 80)
    }
  }

  return (
    <div className="relative w-full h-full">
      {showFullAR ? (
        // Full AR view with camera
        <>
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover z-10" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-20" />
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/80 backdrop-blur-sm"
              onClick={() => setPoiVisible(!poiVisible)}
            >
              {poiVisible ? "Hide POI" : "Show POI"}
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/80 backdrop-blur-sm" onClick={onClose}>
              Exit AR
            </Button>
          </div>

          {/* Navigation panel */}
          <Card className="absolute bottom-4 left-4 right-4 z-30 bg-black/70 text-white border-none">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{navigationInstructions}</p>
                  {nextTurn && <p className="text-sm text-gray-300">Next: {nextTurn}</p>}
                </div>
                <Badge className="bg-indigo-600">{distance}</Badge>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // Map view with AR button
        <>
          <div ref={mapContainerRef} className="w-full h-full rounded-lg overflow-hidden" />
          <Button
            className="absolute bottom-4 right-4 z-10 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => onClose && onClose()}
          >
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
              className="mr-2"
            >
              <path d="M21 9v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <path d="M9 17v4"></path>
              <path d="M15 17v4"></path>
              <path d="M9 2v5"></path>
              <path d="M15 2v5"></path>
            </svg>
            View in AR
          </Button>
        </>
      )}
    </div>
  )
}

