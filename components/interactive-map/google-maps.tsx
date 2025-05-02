"use client"

import { useEffect, useRef, useState } from "react"
import { Location } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle } from "lucide-react"

interface GoogleMapsProps {
  onPickupSelect?: (location: Location) => void
  onDestinationSelect?: (location: Location) => void
  pickup?: Location | null
  destination?: Location | null
  showRoute?: boolean
  showDriver?: boolean
  driverLocation?: Location
  currentStep?: number
  className?: string
}

export function GoogleMaps({
  onPickupSelect,
  onDestinationSelect,
  pickup,
  destination,
  showRoute = false,
  showDriver = false,
  driverLocation,
  currentStep = 1,
  className,
}: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null)
  const pickupMarkerRef = useRef<google.maps.Marker | null>(null)
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null)
  const driverMarkerRef = useRef<google.maps.Marker | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)
  const [loadCount, setLoadCount] = useState(0) // Track load attempts
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
  } | null>(null)

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      console.log("Google Maps already loaded");
      setScriptLoaded(true);
      return;
    }

    // Prevent multiple loading attempts
    if (loadCount > 3) {
      console.error("Failed to load Google Maps after multiple attempts");
      setScriptError(true);
      setIsLoading(false);
      return;
    }

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyByMVLJxOSDN9D_WPDp_2qC9lxTj9r0dbI';
    
    console.log(`Loading Google Maps with API key: ${googleMapsApiKey.substring(0, 8)}...`);
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Define callback function globally
    window.initGoogleMaps = () => {
      console.log('Google Maps script loaded successfully via callback');
      setScriptLoaded(true);
      setLoadCount(prev => prev + 1);
    };
    
    script.onload = () => {
      console.log('Google Maps script onload event fired');
    };
    
    script.onerror = (e) => {
      console.error("Failed to load Google Maps script:", e);
      setLoadCount(prev => prev + 1);
      setScriptError(true);
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up
      if (window.initGoogleMaps) {
        // @ts-ignore - Clean up the global callback
        window.initGoogleMaps = undefined;
      }
      
      try {
        document.head.removeChild(script);
      } catch (e) {
        // Script might already have been removed
      }
    };
  }, [loadCount]);

  // Initialize map once script is loaded
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;
    
    try {
      console.log("Initializing Google Map instance");
      setIsLoading(true);
      
      // Create a new Google Map instance
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
      
      googleMapRef.current = map;
      
      // Create directions service and renderer
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // We'll handle our own markers
        polylineOptions: {
          strokeColor: "#4f46e5", // Indigo color
          strokeWeight: 5,
          strokeOpacity: 0.7,
        },
      });
      
      directionsServiceRef.current = directionsService;
      directionsRendererRef.current = directionsRenderer;
      
      // Add click listener for location selection
      if (onPickupSelect || onDestinationSelect) {
        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return;
          
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: event.latLng }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const location: Location = {
                lat: event.latLng!.lat(),
                lng: event.latLng!.lng(),
                address: results[0].formatted_address,
              };
              
              if (!pickup && onPickupSelect) {
                addPickupMarker(location);
                onPickupSelect(location);
              } else if (pickup && !destination && onDestinationSelect) {
                addDestinationMarker(location);
                onDestinationSelect(location);
              }
            }
          });
        });
      }
      
      // If we have initial pickup and destination locations, add them
      if (pickup) {
        addPickupMarker(pickup);
      }
      
      if (destination) {
        addDestinationMarker(destination);
      }
      
      // Calculate and display route if needed
      if (showRoute && pickup && destination) {
        calculateRoute();
      }
      
      // Add driver marker if needed
      if (showDriver && driverLocation) {
        addDriverMarker(driverLocation);
      }
      
      // Add a resize event listener to ensure the map fits its container
      const resizeMap = () => {
        if (googleMapRef.current) {
          google.maps.event.trigger(googleMapRef.current, 'resize');
          
          // Recenter or fit bounds if we have markers
          if (pickup && destination) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend({ lat: pickup.lat, lng: pickup.lng });
            bounds.extend({ lat: destination.lat, lng: destination.lng });
            googleMapRef.current.fitBounds(bounds);
          } else if (pickup) {
            googleMapRef.current.setCenter({ lat: pickup.lat, lng: pickup.lng });
          }
        }
      };
      
      window.addEventListener('resize', resizeMap);
      
      // Trigger resize after a short delay to ensure the container is fully rendered
      setTimeout(resizeMap, 300);
      
      setIsLoading(false);
      
      return () => {
        window.removeEventListener('resize', resizeMap);
      };
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setScriptError(true);
      setIsLoading(false);
    }
  }, [scriptLoaded, pickup, destination, showRoute, showDriver, driverLocation, onPickupSelect, onDestinationSelect]);

  // Update the driver marker when position changes
  useEffect(() => {
    if (!showDriver || !driverLocation || !googleMapRef.current) return;
    addDriverMarker(driverLocation);
  }, [showDriver, driverLocation, currentStep]);

  // Calculate route when pickup or destination changes
  useEffect(() => {
    if (showRoute && pickup && destination && googleMapRef.current) {
      calculateRoute();
    }
  }, [pickup, destination, showRoute]);

  // Add pickup marker
  const addPickupMarker = (location: Location) => {
    if (!googleMapRef.current) return;
    
    // Remove existing marker if any
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setMap(null);
    }
    
    // Create new marker
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: googleMapRef.current,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        scaledSize: new google.maps.Size(32, 32),
      },
      title: location.name || "Pickup Location",
    });
    
    pickupMarkerRef.current = marker;
    
    // Center map on marker
    googleMapRef.current.panTo({ lat: location.lat, lng: location.lng });
    googleMapRef.current.setZoom(15);
  };

  // Add destination marker
  const addDestinationMarker = (location: Location) => {
    if (!googleMapRef.current) return;
    
    // Remove existing marker if any
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
    }
    
    // Create new marker
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: googleMapRef.current,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        scaledSize: new google.maps.Size(32, 32),
      },
      title: location.name || "Destination",
    });
    
    destinationMarkerRef.current = marker;
    
    // If we're just adding the destination marker, fit bounds to include both markers
    if (pickupMarkerRef.current) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickupMarkerRef.current.getPosition()!);
      bounds.extend(marker.getPosition()!);
      googleMapRef.current.fitBounds(bounds);
    }
  };

  // Add driver marker
  const addDriverMarker = (location: Location) => {
    if (!googleMapRef.current) return;
    
    const position = { lat: location.lat, lng: location.lng };
    
    // Update existing marker if any
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition(position);
    } else {
      // Create new marker
      const marker = new google.maps.Marker({
        position,
        map: googleMapRef.current,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          scaledSize: new google.maps.Size(32, 32),
        },
        title: "Driver Location",
        // Add a slight bounce animation
        animation: google.maps.Animation.BOUNCE,
      });
      
      driverMarkerRef.current = marker;
      
      // Stop the bounce after 3 seconds
      setTimeout(() => {
        if (driverMarkerRef.current) {
          driverMarkerRef.current.setAnimation(null);
        }
      }, 3000);
    }
  };

  // Calculate route between pickup and destination
  const calculateRoute = () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || !pickup || !destination) {
      return;
    }
    
    const origin = { lat: pickup.lat, lng: pickup.lng };
    const dest = { lat: destination.lat, lng: destination.lng };
    
    directionsServiceRef.current.route(
      {
        origin,
        destination: dest,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current!.setDirections(result);
          
          // Extract and store real-time route information
          const route = result.routes[0];
          if (route && route.legs.length > 0) {
            const leg = route.legs[0];
            setRouteDetails({
              distance: leg.distance.text,
              duration: leg.duration.text
            });
            
            // Publish the route information event for other components to use
            const routeInfoEvent = new CustomEvent('route-calculated', {
              detail: {
                distance: leg.distance.text,
                distanceValue: leg.distance.value, // in meters
                duration: leg.duration.text,
                durationValue: leg.duration.value, // in seconds
                startLocation: leg.start_location,
                endLocation: leg.end_location,
                steps: leg.steps
              }
            });
            
            window.dispatchEvent(routeInfoEvent);
            console.log("Route calculated successfully:", {
              distance: leg.distance.text,
              duration: leg.duration.text
            });
          }
        } else {
          console.error("Error calculating route:", status);
        }
      }
    );
  };

  // If there's an error loading the script, show a fallback
  if (scriptError) {
    return (
      <Card className={`flex items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-500 font-medium">Failed to load Google Maps</p>
          <p className="text-xs text-gray-500 mt-1">Please check your connection and API key</p>
          <button 
            className="mt-2 text-xs bg-indigo-600 text-white px-3 py-1 rounded-md"
            onClick={() => {
              setScriptError(false);
              setLoadCount(0);
            }}
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[250px] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
          <Skeleton className="h-full w-full" />
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[250px] rounded-lg map-container"
        style={{ 
          visibility: isLoading ? 'hidden' : 'visible',
          height: '100%',
          minHeight: '250px',
        }}
      />
    </div>
  );
}

// Declare the global callback for the Google Maps API
declare global {
  interface Window {
    initGoogleMaps: () => void;
  }
} 