"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Car, Clock, MapPin, Search } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import Script from "next/script"

interface Location {
  lng: number
  lat: number
  address?: string
  name?: string
}

interface OpenLayersMapProps {
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

export function OpenLayersMap({
  onPickupSelect,
  onDestinationSelect,
  pickup,
  destination,
  showRoute = false,
  showDriver = false,
  driverLocation,
  currentStep = 1,
  className,
}: OpenLayersMapProps) {
  const { favoriteLocations } = useAppContext()
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [hasMapError, setHasMapError] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; traffic?: string } | null>(null)
  const olMapRef = useRef<any>(null)
  const pickupMarkerRef = useRef<any>(null)
  const destinationMarkerRef = useRef<any>(null)
  const driverMarkerRef = useRef<any>(null)
  const loadTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [olLoaded, setOlLoaded] = useState(false)

  // Initialize map when OpenLayers is loaded
  useEffect(() => {
    if (!olLoaded || !mapRef.current) return

    const initMap = async () => {
      try {
        setLoading(true)
        setHasMapError(false)

        // Create map
        const { Map, View } = window.ol
        const { Tile } = window.ol.layer
        const { OSM } = window.ol.source
        const { fromLonLat } = window.ol.proj

        // Create a map instance
        const map = new Map({
          target: mapRef.current,
          layers: [
            new Tile({
              source: new OSM()
            })
          ],
          view: new View({
            center: fromLonLat([-122.4194, 37.7749]), // San Francisco coordinates
            zoom: 13
          })
        })

        // Store map reference
        olMapRef.current = map

        // Add click handling to get locations
        map.on('singleclick', (evt: any) => {
          const { coordinate } = evt
          const { toLonLat } = window.ol.proj
          const lonLat = toLonLat(coordinate)
          
          // Get the address using Nominatim (OpenStreetMap)
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${lonLat[0]}&lat=${lonLat[1]}`)
            .then(response => response.json())
            .then(data => {
              const location = {
                lng: lonLat[0],
                lat: lonLat[1],
                address: data.display_name
              }
              
              if (!pickup && onPickupSelect) {
                addPickupMarker(location)
                onPickupSelect(location)
              } else if (pickup && !destination && onDestinationSelect) {
                addDestinationMarker(location)
                onDestinationSelect(location)
              }
            })
            .catch(error => {
              console.error("Error getting address:", error)
            })
        })

        // Set up a timer to handle case where map doesn't load properly
        loadTimerRef.current = setTimeout(() => {
          console.log("Map load timeout triggered")
          if (loading) {
            setMapLoaded(true)
            setLoading(false)
          }
        }, 3000)

        // Indicate the map is loaded
        setMapLoaded(true)
        setLoading(false)
        
        // If we have initial pickup and destination, add markers
        if (pickup && typeof pickup !== "string") {
          addPickupMarker(pickup)
        }
        
        if (destination && typeof destination !== "string") {
          addDestinationMarker(destination)
        }
        
        // Add driver marker if we have driver location
        if (showDriver && driverLocation) {
          addDriverMarker(driverLocation)
        }
        
        // Calculate route if we have both pickup and destination
        if (showRoute && pickup && destination && typeof pickup !== "string" && typeof destination !== "string") {
          calculateRoute(pickup, destination)
        }

        // Clean up timer and map when component unmounts
        return () => {
          if (loadTimerRef.current) {
            clearTimeout(loadTimerRef.current)
          }
        }
      } catch (error) {
        console.error("Error initializing map:", error)
        setHasMapError(true)
        setLoading(false)
      }
    }

    initMap()
  }, [olLoaded, pickup, destination, showRoute, showDriver, driverLocation, onPickupSelect, onDestinationSelect])

  // Add pickup marker to map
  const addPickupMarker = (location: Location) => {
    if (!olMapRef.current) return
    
    try {
      const { fromLonLat } = window.ol.proj
      const { Point } = window.ol.geom
      const { Feature } = window.ol
      const { Vector: VectorLayer } = window.ol.layer
      const { Vector: VectorSource } = window.ol.source
      const { Style, Icon } = window.ol.style
      
      // Remove existing marker
      if (pickupMarkerRef.current) {
        olMapRef.current.removeLayer(pickupMarkerRef.current)
      }
      
      // Create marker
      const marker = new Feature({
        geometry: new Point(fromLonLat([location.lng, location.lat]))
      })
      
      // Create a custom style for the marker
      const markerStyle = new Style({
        image: new Icon({
          color: '#4f46e5',
          crossOrigin: 'anonymous',
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          scale: 0.7
        })
      })
      
      marker.setStyle(markerStyle)
      
      // Add marker to the map
      const vectorSource = new VectorSource({
        features: [marker]
      })
      
      const vectorLayer = new VectorLayer({
        source: vectorSource
      })
      
      olMapRef.current.addLayer(vectorLayer)
      pickupMarkerRef.current = vectorLayer
      
      // Center map on marker
      const { View } = window.ol
      const view = olMapRef.current.getView()
      view.animate({
        center: fromLonLat([location.lng, location.lat]),
        duration: 1000,
        zoom: 15
      })
    } catch (error) {
      console.error("Error adding pickup marker:", error)
    }
  }
  
  // Add destination marker to map
  const addDestinationMarker = (location: Location) => {
    if (!olMapRef.current) return
    
    try {
      const { fromLonLat } = window.ol.proj
      const { Point } = window.ol.geom
      const { Feature } = window.ol
      const { Vector: VectorLayer } = window.ol.layer
      const { Vector: VectorSource } = window.ol.source
      const { Style, Icon } = window.ol.style
      
      // Remove existing marker
      if (destinationMarkerRef.current) {
        olMapRef.current.removeLayer(destinationMarkerRef.current)
      }
      
      // Create marker
      const marker = new Feature({
        geometry: new Point(fromLonLat([location.lng, location.lat]))
      })
      
      // Create a custom style for the marker
      const markerStyle = new Style({
        image: new Icon({
          color: '#ef4444',
          crossOrigin: 'anonymous',
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          scale: 0.7
        })
      })
      
      marker.setStyle(markerStyle)
      
      // Add marker to the map
      const vectorSource = new VectorSource({
        features: [marker]
      })
      
      const vectorLayer = new VectorLayer({
        source: vectorSource
      })
      
      olMapRef.current.addLayer(vectorLayer)
      destinationMarkerRef.current = vectorLayer
      
      // Center map on marker
      const { View } = window.ol
      const view = olMapRef.current.getView()
      view.animate({
        center: fromLonLat([location.lng, location.lat]),
        duration: 1000,
        zoom: 14
      })
    } catch (error) {
      console.error("Error adding destination marker:", error)
    }
  }
  
  // Add driver marker to map
  const addDriverMarker = (location: Location) => {
    if (!olMapRef.current) return
    
    try {
      const { fromLonLat } = window.ol.proj
      const { Point } = window.ol.geom
      const { Feature } = window.ol
      const { Vector: VectorLayer } = window.ol.layer
      const { Vector: VectorSource } = window.ol.source
      const { Style, Icon, Circle, Fill, Stroke } = window.ol.style
      
      // Remove existing marker
      if (driverMarkerRef.current) {
        olMapRef.current.removeLayer(driverMarkerRef.current)
      }
      
      // Create marker
      const marker = new Feature({
        geometry: new Point(fromLonLat([location.lng, location.lat]))
      })
      
      // Create a custom style for the marker
      const markerStyle = new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: '#4f46e5'
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 2
          })
        })
      })
      
      marker.setStyle(markerStyle)
      
      // Add marker to the map
      const vectorSource = new VectorSource({
        features: [marker]
      })
      
      const vectorLayer = new VectorLayer({
        source: vectorSource
      })
      
      olMapRef.current.addLayer(vectorLayer)
      driverMarkerRef.current = vectorLayer
    } catch (error) {
      console.error("Error adding driver marker:", error)
    }
  }
  
  // Calculate route between pickup and destination
  const calculateRoute = (pickup: Location, destination: Location) => {
    try {
      // Use OSRM for routing
      const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
      
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0]
            
            // Add route to map
            const { fromLonLat } = window.ol.proj
            const { Feature } = window.ol
            const { Vector: VectorLayer } = window.ol.layer
            const { Vector: VectorSource } = window.ol.source
            const { Style, Stroke } = window.ol.style
            const { LineString } = window.ol.geom
            
            // Convert coordinates to OpenLayers format
            const coordinates = route.geometry.coordinates.map((coord: [number, number]) => {
              return fromLonLat(coord)
            })
            
            // Create route feature
            const routeFeature = new Feature({
              geometry: new LineString(coordinates)
            })
            
            // Style the route
            const routeStyle = new Style({
              stroke: new Stroke({
                color: '#4f46e5',
                width: 6
              })
            })
            
            routeFeature.setStyle(routeStyle)
            
            // Add route to map
            const vectorSource = new VectorSource({
              features: [routeFeature]
            })
            
            const vectorLayer = new VectorLayer({
              source: vectorSource
            })
            
            olMapRef.current.addLayer(vectorLayer)
            
            // Fit map to show route
            const { boundingExtent } = window.ol.extent
            const extent = boundingExtent(coordinates)
            olMapRef.current.getView().fit(extent, {
              padding: [50, 50, 50, 50],
              duration: 1000
            })
            
            // Set route info
            setRouteInfo({
              distance: formatDistance(route.distance),
              duration: formatDuration(route.duration),
              traffic: "Normal" // OSRM doesn't provide traffic info
            })
          }
        })
        .catch(error => {
          console.error("Error calculating route:", error)
        })
    } catch (error) {
      console.error("Error calculating route:", error)
    }
  }

  // Format distance in meters to a readable string
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    } else {
      return `${(meters / 1000).toFixed(1)} km`
    }
  }

  // Format duration in seconds to a readable string
  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours} hr ${remainingMinutes} min`
    }
  }

  // Handle map reset
  const handleResetMap = () => {
    setHasMapError(false)
    setLoading(true)
    
    // Re-initialize the map
    if (olMapRef.current) {
      olMapRef.current.setTarget(undefined)
      olMapRef.current = null
    }
    
    // Force re-initialization of map
    setTimeout(() => {
      setOlLoaded(false)
      setTimeout(() => {
        setOlLoaded(true)
      }, 100)
    }, 500)
  }

  // Handle search for locations
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      // Use Nominatim for geocoding
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data && data.length > 0) {
        setSearchResults(data.map((result: any) => ({
          id: result.place_id,
          name: result.display_name.split(',')[0],
          address: result.display_name,
          coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
        })))
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching location:", error)
      setSearchResults([])
    }
  }

  // Handle search result selection
  const handleSearchResultSelect = (result: any) => {
    const location = {
      lng: result.coordinates[0],
      lat: result.coordinates[1],
      address: result.address
    }
    
    if (!pickup && onPickupSelect) {
      addPickupMarker(location)
      onPickupSelect(location)
    } else if (pickup && !destination && onDestinationSelect) {
      addDestinationMarker(location)
      onDestinationSelect(location)
    }
    
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/ol@v7.3.0/dist/ol.js"
        onLoad={() => setOlLoaded(true)}
        onError={() => setHasMapError(true)}
      />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v7.3.0/ol.css" />
      
      <div className={`relative w-full h-full ${className}`}>
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        ) : hasMapError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-sm text-gray-800 mb-4">Could not load the map</p>
            <Button onClick={handleResetMap} variant="default">
              Reload Map
            </Button>
          </div>
        ) : (
          <>
            <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />

            {/* Search bar */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for a location"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pr-10 bg-white/90 backdrop-blur-sm"
                />
                <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>

                {searchResults.length > 0 && (
                  <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto z-20">
                    <CardContent className="p-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => handleSearchResultSelect(result)}
                        >
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">{result.address}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Route information */}
            {routeInfo && showRoute && (
              <Card className="absolute bottom-4 left-4 right-4 z-10 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium">Distance</p>
                        <p className="text-lg font-bold">{routeInfo.distance}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-lg font-bold">{routeInfo.duration}</p>
                      </div>
                      {routeInfo.traffic && (
                        <div>
                          <p className="text-sm font-medium">Traffic</p>
                          <Badge
                            className={`
                            ${
                              routeInfo.traffic === "Light"
                                ? "bg-green-100 text-green-800"
                                : routeInfo.traffic === "Normal"
                                  ? "bg-blue-100 text-blue-800"
                                  : routeInfo.traffic === "Moderate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : routeInfo.traffic === "Heavy"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-red-100 text-red-800"
                            }
                          `}
                          >
                            {routeInfo.traffic}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  )
} 