"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RiderLayout } from "@/components/layouts/rider-layout"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/app-context"
import type { RideType, Location as AppLocation, Driver } from "@/contexts/app-context"
import { Location as MapLocation } from "@/lib/types"
import { Car, ChevronRight, Clock, CreditCard, Leaf, Loader2, MapPin, Navigation, Wallet, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { LocationSearch } from "@/components/ride-booking/location-search"
import { RouteVisualization } from "@/components/ride-booking/route-visualization"
import { VehicleOptionCard } from "@/components/ride-booking/vehicle-option-card"
import { DriverCard } from "@/components/ride-booking/driver-card"
import { SmartInsightsCard } from "@/components/ride-booking/smart-insights-card"
import { estimateRoute, RouteEstimate, getRouteInsights, getWeatherInsights, getRideEfficiencyAnalysis, getSmartTravelTips } from "@/lib/gemini-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BookRidePage() {
  const router = useRouter()
  const { bookRide, loading, favoriteLocations, user } = useAppContext()

  // Booking steps: 1 = location selection, 2 = ride options, 3 = driver selection
  const [bookingStep, setBookingStep] = useState(1)
  const [formData, setFormData] = useState({
    pickup: "",
    destination: "",
    rideType: "standard" as RideType,
    paymentMethod: "card",
  })

  const [pickupLocation, setPickupLocation] = useState<AppLocation | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<AppLocation | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteEstimate | null>(null)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [userPreferences, setUserPreferences] = useState({
    ecoFriendly: false,
    costSensitive: true,
    comfortPreferred: false,
  });

  // Hardcoded drivers list
  const availableDrivers: Driver[] = [
    {
      id: "1",
      name: "Alice Johnson",
      rating: 4.8,
      avatar: "https://i.pravatar.cc/150?img=1",
      car: {
        model: "Toyota Prius",
        color: "Blue",
        plate: "ABC 123",
        isGreen: true,
      },
      safetyScore: 98,
    },
    {
      id: "2",
      name: "Robert Chen",
      rating: 4.5,
      avatar: "https://i.pravatar.cc/150?img=2",
      car: {
        model: "Honda Civic",
        color: "Red",
        plate: "XYZ 789",
      },
    },
    {
      id: "3",
      name: "Sophia Williams",
      rating: 4.9,
      avatar: "https://i.pravatar.cc/150?img=3",
      car: {
        model: "Tesla Model 3",
        color: "White",
        plate: "TESLA",
        isGreen: true,
      },
      safetyScore: 99,
    },
  ]

  // Calculate fare based on ride type and distance
  const getFare = (rideType: RideType): number => {
    // Base prices
    const basePrices = {
      standard: 12.5,
      premium: 18.75,
      green: 14.5,
      carpool: 9.75,
    }
    
    // If we have route info, adjust fare based on distance
    if (routeInfo) {
      // Extract distance in miles (assuming format "X.X miles (Y.Y km)")
      const distanceMatch = routeInfo.distance.match(/(\d+\.\d+)\s*miles/);
      const distanceMiles = distanceMatch ? parseFloat(distanceMatch[1]) : 0;
      
      // Base fare + distance adjustment
      return basePrices[rideType] + (distanceMiles * 0.5);
    }
    
    return basePrices[rideType];
  }

  const currentFare = getFare(formData.rideType)

  // Calculate ETA for drivers (random for demo)
  const getDriverETA = (driver: Driver): string => {
    const minutes = Math.floor(Math.random() * 10) + 1;
    return `${minutes} min`;
  }

  // Convert from Map location to App location
  const convertToAppLocation = (location: MapLocation): AppLocation => {
    return {
      lng: location.lng,
      lat: location.lat,
      address: location.address || "Unknown location",
      name: location.name,
    }
  }

  // Handler for location selection
  const handlePickupSelect = (location: MapLocation) => {
    const appLocation = convertToAppLocation(location)
    setPickupLocation(appLocation)
    
    if (destinationLocation) {
      calculateRoute(appLocation, destinationLocation);
    }
  }

  const handleDestinationSelect = (location: MapLocation) => {
    const appLocation = convertToAppLocation(location)
    setDestinationLocation(appLocation)
    
    if (pickupLocation) {
      calculateRoute(pickupLocation, appLocation);
    }
  }
  
  // Calculate route using Gemini API and Google Maps
  const calculateRoute = async (pickup: AppLocation, destination: AppLocation) => {
    setIsCalculatingRoute(true);
    
    try {
      // Validate locations first
      if (!pickup.lat || !pickup.lng || !destination.lat || !destination.lng) {
        toast.error("Invalid location coordinates. Please select valid locations.");
        console.error("Invalid coordinates:", { pickup, destination });
        setIsCalculatingRoute(false);
        return;
      }
      
      // Log that we're making the API call
      console.log("Calculating route between:", {
        pickup: `${pickup.address} (${pickup.lat},${pickup.lng})`,
        destination: `${destination.address} (${destination.lat},${destination.lng})`
      });
      
      const mapPickup: MapLocation = {
        lat: pickup.lat,
        lng: pickup.lng,
        address: pickup.address
      };
      
      const mapDestination: MapLocation = {
        lat: destination.lat,
        lng: destination.lng,
        address: destination.address
      };
      
      // Call Gemini API directly
      try {
        const geminiRouteInfo = await estimateRoute(mapPickup, mapDestination);
        
        if (geminiRouteInfo) {
          console.log("Gemini API route data:", geminiRouteInfo);
          setRouteInfo(geminiRouteInfo);
          
          // If the calculation was successful, proceed to next step
          if (bookingStep === 1 && pickup && destination) {
            setBookingStep(2);
          }
          
          toast.success("Route calculated successfully!");
        } else {
          throw new Error("No valid response from Gemini API");
        }
      } catch (geminiError) {
        console.error("Error with Gemini API:", geminiError);
        
        // Fallback to default data if Gemini fails
        toast.error("Could not calculate accurate route. Using estimates.");
        setRouteInfo({
          distance: "5.2 miles (8.4 km)",
          duration: "15 minutes",
          carbonFootprint: 2.1,
          trafficLevel: "medium"
        });
        
        // Still proceed to next step with fallback data
        if (bookingStep === 1) {
          setBookingStep(2);
        }
      }
    } catch (error: any) {
      console.error("Error calculating route:", error);
      
      // Provide more specific error messages based on the error
      if (error.message?.includes("API key")) {
        toast.error("Authentication error with routing API. Please check your API key.");
      } else if (error.message?.includes("Invalid response") || error.message?.includes("parse")) {
        toast.error("Received invalid data from routing API. Using default estimates.");
        // Set fallback data for testing
        setRouteInfo({
          distance: "5.2 miles (8.4 km)",
          duration: "15 minutes",
          carbonFootprint: 2.1,
          trafficLevel: "medium"
        });
        
        // Still proceed to next step with fallback data
        if (bookingStep === 1) {
          setBookingStep(2);
        }
      } else {
        toast.error("Failed to calculate route. Please try again or enter more specific locations.");
      }
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Update user preferences to dynamically change based on ride type selection
  useEffect(() => {
    if (formData.rideType === "green") {
      setUserPreferences(prev => ({ ...prev, ecoFriendly: true }));
    } else if (formData.rideType === "premium") {
      setUserPreferences(prev => ({ ...prev, comfortPreferred: true, ecoFriendly: false }));
    } else if (formData.rideType === "carpool") {
      setUserPreferences(prev => ({ ...prev, costSensitive: true, ecoFriendly: true }));
    } else if (formData.rideType === "standard") {
      setUserPreferences(prev => ({ ...prev, costSensitive: true, comfortPreferred: false, ecoFriendly: false }));
    }
  }, [formData.rideType]);

  // Handle ride type selection
  const handleRideTypeSelect = (type: RideType) => {
    setFormData(prev => ({ ...prev, rideType: type }));
    // Immediately update user preferences based on selected ride type
    if (type === "green") {
      setUserPreferences(prev => ({ ...prev, ecoFriendly: true }));
    } else if (type === "premium") {
      setUserPreferences(prev => ({ ...prev, comfortPreferred: true, ecoFriendly: false }));
    } else if (type === "carpool") {
      setUserPreferences(prev => ({ ...prev, costSensitive: true, ecoFriendly: true }));
    } else if (type === "standard") {
      setUserPreferences(prev => ({ ...prev, costSensitive: true, comfortPreferred: false, ecoFriendly: false }));
    }
  };
  
  // Handle payment method selection
  const handlePaymentMethodSelect = (method: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

  // Handle personalized ride type selection from smart insights
  const handleSmartRideTypeSelection = (rideType: string) => {
    if (["standard", "premium", "green", "carpool"].includes(rideType as RideType)) {
      handleRideTypeSelect(rideType as RideType);
      toast.success(`Selected ${rideType} ride based on AI recommendation`);
    }
  };

  // Function to handle booking confirmation after driver selection
  const confirmRide = async () => {
    if (!pickupLocation || !destinationLocation || !selectedDriver) {
      toast.error("Please complete all selections");
      return;
    }
    
    // Simulate ride booking by creating a ride object
    const ride = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      from: pickupLocation,
      to: destinationLocation,
      price: currentFare,
      status: "confirmed",
      driver: selectedDriver,
      rideType: formData.rideType,
      carbonFootprint: routeInfo?.carbonFootprint || 0,
      carbonSaved: routeInfo?.trafficLevel === "low" ? 1.2 : 0.8,
      route: {
        distance: routeInfo?.distance || "Unknown",
        duration: routeInfo?.duration || "Unknown",
      },
      paymentMethod: formData.paymentMethod,
      routeInfo: routeInfo,
    }
    
    // Store ride details in sessionStorage for access on tracking page
    try {
      sessionStorage.setItem('currentRide', JSON.stringify(ride));
    } catch (e) {
      console.error("Could not save ride to sessionStorage:", e);
    }
    
    // Call bookRide if available. Otherwise, simulate and route.
    if (bookRide) {
      try {
        await bookRide(ride.from, ride.to, ride.rideType, formData.paymentMethod, { 
          driver: selectedDriver,
          route: ride.route,
          routeInfo: routeInfo
        });
        toast.success("Ride booked successfully!");
        router.push("/rider/tracking");
      } catch (error) {
        console.error(error);
        toast.error("Failed to book ride.");
      }
    } else {
      toast.success("Ride booked successfully!");
      router.push("/rider/tracking");
    }
  }

  return (
    <RiderLayout>
      <div className="p-4 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Book a Ride</h1>
          <p className="text-muted-foreground mt-1">Enter your trip details to find available rides</p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${bookingStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            1
          </div>
          <div className={`h-1 w-12 ${bookingStep > 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${bookingStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            2
          </div>
          <div className={`h-1 w-12 ${bookingStep > 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${bookingStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            3
          </div>
        </div>

        {/* Step 1: Location Selection */}
        {bookingStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter Your Route</CardTitle>
                <CardDescription>Where are you going today?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <LocationSearch 
                    type="pickup"
                    onChange={handlePickupSelect} 
                    placeholder="Enter pickup location"
                    value={pickupLocation?.address || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <LocationSearch 
                    type="destination"
                    onChange={handleDestinationSelect} 
                    placeholder="Enter destination"
                    value={destinationLocation?.address || ''}
                  />
                </div>
                
                {/* Saved Locations */}
                {favoriteLocations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Saved Locations</h3>
                    <div className="flex flex-wrap gap-2">
                      {favoriteLocations.map((location, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handlePickupSelect(location as any)}
                        >
                          <MapPin className="h-3 w-3" />
                          {location.name || location.address.split(',')[0]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-4" 
                  disabled={!pickupLocation || !destinationLocation || isCalculatingRoute}
                  onClick={() => {
                    if (pickupLocation && destinationLocation) {
                      calculateRoute(pickupLocation, destinationLocation);
                    } else {
                      toast.error("Please enter both pickup and destination locations");
                    }
                  }}
                >
                  {isCalculatingRoute ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating Route...
                    </>
                  ) : (
                    <>Continue to Ride Options</>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            {routeInfo ? (
              <SmartInsightsCard
                pickup={pickupLocation}
                destination={destinationLocation}
                routeInfo={routeInfo}
                userPreferences={userPreferences}
                onRideTypeSelected={handleSmartRideTypeSelection}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Recommendations</CardTitle>
                  <CardDescription>Enter your locations to get personalized ride suggestions</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-10">
                  <div className="mb-6 text-gray-400">
                    <Navigation className="h-16 w-16 mx-auto mb-4" />
                    <p>Select your pickup and destination locations to receive AI-powered recommendations and insights powered by Gemini.</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Smart route optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Weather impacts on your journey</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Personalized ride recommendations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* Step 2: Ride Options */}
        {bookingStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column (2/5 width) */}
            <div className="lg:col-span-2 space-y-6">
              <SmartInsightsCard
                pickup={pickupLocation}
                destination={destinationLocation}
                routeInfo={routeInfo}
                userPreferences={userPreferences}
                onRideTypeSelected={handleSmartRideTypeSelection}
              />
            </div>
            
            {/* Right column (3/5 width) */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Select Ride Options</CardTitle>
                  <CardDescription>Choose your ride type and payment method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Ride Type</h3>
                    <div className="space-y-3">
                      <VehicleOptionCard 
                        type="standard"
                        title="Standard"
                        description="Affordable, everyday ride"
                        price={getFare("standard")}
                        eta="2 min away"
                        isSelected={formData.rideType === "standard"}
                        onSelect={() => handleRideTypeSelect("standard")}
                      />
                      
                      <VehicleOptionCard 
                        type="premium"
                        title="Premium"
                        description="Luxury vehicles, top-rated drivers"
                        price={getFare("premium")}
                        eta="4 min away"
                        isSelected={formData.rideType === "premium"}
                        onSelect={() => handleRideTypeSelect("premium")}
                      />
                      
                      <VehicleOptionCard 
                        type="green"
                        title="Green"
                        description="Electric & hybrid vehicles only"
                        price={getFare("green")}
                        eta="3 min away"
                        isSelected={formData.rideType === "green"}
                        onSelect={() => handleRideTypeSelect("green")}
                      />
                      
                      <VehicleOptionCard 
                        type="carpool"
                        title="Carpool"
                        description="Share your ride, save money"
                        price={getFare("carpool")}
                        eta="5 min away"
                        isSelected={formData.rideType === "carpool"}
                        onSelect={() => handleRideTypeSelect("carpool")}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Payment Method</h3>
                    <Select
                      defaultValue={formData.paymentMethod}
                      onValueChange={(value) => handlePaymentMethodSelect(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">
                          <div className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Credit Card (•••• 4242)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="wallet">
                          <div className="flex items-center">
                            <Wallet className="mr-2 h-4 w-4" />
                            <span>RideChain Wallet ($25.40)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cash">
                          <div className="flex items-center">
                            <Wallet className="mr-2 h-4 w-4" />
                            <span>Cash</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Base fare</span>
                      <span className="text-sm">${(currentFare * 0.8).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Service fee</span>
                      <span className="text-sm">${(currentFare * 0.2).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${currentFare.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setBookingStep(1)}
                    >
                      Back
                    </Button>
                    
                    <Button 
                      className="flex-1"
                      onClick={() => setBookingStep(3)}
                    >
                      Continue to Driver Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {/* Step 3: Driver Selection */}
        {bookingStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <RouteVisualization 
                pickup={pickupLocation}
                destination={destinationLocation}
                routeInfo={routeInfo}
              />
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Ride Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>{formData.rideType.charAt(0).toUpperCase() + formData.rideType.slice(1)}</span>
                    </div>
                    <span className="text-sm">${currentFare.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>Duration</span>
                    </div>
                    <span className="text-sm">{routeInfo?.duration || "Unknown"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>Payment</span>
                    </div>
                    <span className="text-sm capitalize">{formData.paymentMethod}</span>
                  </div>
                  
                  {(formData.rideType === "green" || formData.rideType === "carpool") && (
                    <Alert className="mt-2 bg-green-50 border-green-200">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-600">Eco-friendly Choice</AlertTitle>
                      <AlertDescription className="text-green-700 text-xs">
                        You're saving approximately {routeInfo?.carbonFootprint * 0.4} kg of CO2 with this ride option!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select a Driver</CardTitle>
                  <CardDescription>
                    {selectedDriver 
                      ? `${selectedDriver.name} will be your driver` 
                      : "Choose who will drive you to your destination"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {availableDrivers
                      // Filter drivers based on ride type
                      .filter(driver => {
                        if (formData.rideType === "green") {
                          return !!driver.car.isGreen;
                        }
                        return true;
                      })
                      .map(driver => (
                        <DriverCard
                          key={driver.id}
                          driver={driver}
                          isSelected={selectedDriver?.id === driver.id}
                          onSelect={() => setSelectedDriver(driver)}
                          estimatedArrival={getDriverETA(driver)}
                        />
                      ))
                    }
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setBookingStep(2)}
                    >
                      Back
                    </Button>
                    
                    <Button 
                      className="flex-1"
                      disabled={!selectedDriver || loading}
                      onClick={confirmRide}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>Confirm Ride</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RiderLayout>
  )
}

