"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { RiderLayout } from "@/components/layouts/rider-layout"
import { EnhancedMap } from "@/components/interactive-map/enhanced-map"
import { Car, CreditCard, Leaf, MapPin, Navigation, Users, Wallet, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/app-context"
import type { RideType, Location as AppLocation } from "@/contexts/app-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Location as MapLocation } from "@/lib/types"

export default function BookRidePage() {
  const router = useRouter()
  const { bookRide, loading, favoriteLocations, communities, user, getCarbonFootprint, getCarbonSaved } =
    useAppContext()

  const [bookingStep, setBookingStep] = useState(1)
  const [formData, setFormData] = useState({
    pickup: "",
    destination: "",
    rideType: "standard" as RideType,
    paymentMethod: "card",
  })

  const [pickupLocation, setPickupLocation] = useState<AppLocation | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<AppLocation | null>(null)
  const [showCommunityRides, setShowCommunityRides] = useState(false)
  const [safetyFeatures, setSafetyFeatures] = useState({
    shareTrip: true,
    recordAudio: false,
    emergencyContacts: [],
  })

  // Calculate fare based on ride type
  const getFare = (rideType: RideType): number => {
    switch (rideType) {
      case "standard":
        return 12.5
      case "premium":
        return 18.75
      case "green":
        return 14.5
      case "carpool":
        return 9.75
      default:
        return 12.5
    }
  }

  const currentFare = getFare(formData.rideType as RideType)

  // Calculate estimated carbon footprint
  const distance = 2.3 // Mock distance in miles
  const carbonFootprint = getCarbonFootprint(distance, formData.rideType as RideType)
  const carbonSaved = getCarbonSaved(distance, formData.rideType as RideType)

  // Calculate fare based on pickup and destination
  const calculateFare = () => {
    // This is a placeholder function that would normally calculate fare based on distance
    // For now, we'll just use the static fare from getFare
    const fare = getFare(formData.rideType as RideType);
    console.log("Calculated fare:", fare);
    // We could update some state here if needed
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Convert from Map location to App location
  const convertToAppLocation = (location: MapLocation): AppLocation => {
    return {
      lng: location.lng,
      lat: location.lat,
      address: location.address || "Unknown location",
      name: location.name
    }
  }

  // Handlers for map interaction
  const handleMapPickupSelect = (location: MapLocation) => {
    const appLocation = convertToAppLocation(location);
    handlePickupSelect(appLocation);
  }

  const handleMapDestinationSelect = (location: MapLocation) => {
    const appLocation = convertToAppLocation(location);
    handleDestinationSelect(appLocation);
  }

  const handlePickupSelect = (location: AppLocation) => {
    setFormData({
      ...formData,
      pickup: location as any
    });
    
    setPickupLocation(location);
    
    // If we have both pickup and destination, calculate fare
    if (formData.destination) {
      calculateFare();
    }
  }

  const handleDestinationSelect = (location: AppLocation) => {
    setFormData({
      ...formData,
      destination: location as any
    });
    
    setDestinationLocation(location);
    
    // If we have both pickup and destination, calculate fare
    if (formData.pickup) {
      calculateFare();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (bookingStep === 1) {
      setBookingStep(2)
    } else {
      // Final booking submission
      try {
        const pickup = pickupLocation || formData.pickup
        const destination = destinationLocation || formData.destination

        await bookRide(pickup, destination, formData.rideType as RideType, formData.paymentMethod, { safetyFeatures })
        router.push("/rider/tracking")
      } catch (error) {
        console.error("Error booking ride:", error)
      }
    }
  }

  // Find community rides that match the route
  const matchingCommunityRides = communities.filter((community) =>
    community.routes?.some(
      (route) => route.from.address.includes(formData.pickup) || route.to.address.includes(formData.destination),
    ),
  )

  return (
    <RiderLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book a Ride</h1>
          <p className="text-muted-foreground">Enter your pickup and destination to get started</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Ride Details</CardTitle>
              <CardDescription>
                {bookingStep === 1 ? "Enter your route information" : "Select ride options"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {bookingStep === 1 ? (
                  <>
                    <Tabs defaultValue="address">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="address">Address</TabsTrigger>
                        <TabsTrigger value="favorites">Favorites</TabsTrigger>
                      </TabsList>

                      <TabsContent value="address" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pickup">Pickup Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="pickup"
                              name="pickup"
                              placeholder="Enter pickup address"
                              className="pl-9"
                              value={formData.pickup}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="destination">Destination</Label>
                          <div className="relative">
                            <Navigation className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="destination"
                              name="destination"
                              placeholder="Enter destination address"
                              className="pl-9"
                              value={formData.destination}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="favorites">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Pickup Location</Label>
                            <Select
                              onValueChange={(value) => {
                                const location = favoriteLocations.find((loc) => loc.address === value)
                                if (location) handlePickupSelect(location)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select saved location" />
                              </SelectTrigger>
                              <SelectContent>
                                {favoriteLocations.map((location, index) => (
                                  <SelectItem key={index} value={location.address}>
                                    {location.name || location.address}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Destination</Label>
                            <Select
                              onValueChange={(value) => {
                                const location = favoriteLocations.find((loc) => loc.address === value)
                                if (location) handleDestinationSelect(location)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select saved location" />
                              </SelectTrigger>
                              <SelectContent>
                                {favoriteLocations.map((location, index) => (
                                  <SelectItem key={index} value={location.address}>
                                    {location.name || location.address}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {matchingCommunityRides.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Switch
                            id="community-rides"
                            checked={showCommunityRides}
                            onCheckedChange={setShowCommunityRides}
                          />
                          <Label htmlFor="community-rides">Show Community Rides</Label>
                        </div>

                        {showCommunityRides && (
                          <Alert className="bg-indigo-50 border-indigo-200">
                            <Users className="h-4 w-4 text-indigo-600" />
                            <AlertTitle className="text-indigo-600">Community Rides Available</AlertTitle>
                            <AlertDescription className="text-indigo-700">
                              {matchingCommunityRides.length} community rides match your route. Save money and reduce
                              emissions by carpooling!
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4" disabled={loading}>
                      {loading ? "Finding Routes..." : "Continue"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Ride Type</Label>
                      <RadioGroup
                        defaultValue={formData.rideType}
                        onValueChange={(value) => handleSelectChange("rideType", value)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                          <Label
                            htmlFor="standard"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600"
                          >
                            <Car className="mb-3 h-6 w-6" />
                            <span className="text-sm font-medium">Standard</span>
                            <span className="text-xs text-muted-foreground mt-1">4 seats</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="premium" id="premium" className="peer sr-only" />
                          <Label
                            htmlFor="premium"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600"
                          >
                            <Car className="mb-3 h-6 w-6" />
                            <span className="text-sm font-medium">Premium</span>
                            <span className="text-xs text-muted-foreground mt-1">Luxury, 4 seats</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="green" id="green" className="peer sr-only" />
                          <Label
                            htmlFor="green"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600"
                          >
                            <Leaf className="mb-3 h-6 w-6 text-green-600" />
                            <span className="text-sm font-medium">Green</span>
                            <span className="text-xs text-muted-foreground mt-1">Electric vehicle</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="carpool" id="carpool" className="peer sr-only" />
                          <Label
                            htmlFor="carpool"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600"
                          >
                            <Users className="mb-3 h-6 w-6 text-indigo-600" />
                            <span className="text-sm font-medium">Carpool</span>
                            <span className="text-xs text-muted-foreground mt-1">Shared ride, save money</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <Select
                        defaultValue={formData.paymentMethod}
                        onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                      >
                        <SelectTrigger id="payment-method">
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
                              <span>RideChain Wallet</span>
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

                    <div className="space-y-2 mt-4">
                      <Label>Safety Features</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="share-trip"
                            checked={safetyFeatures.shareTrip}
                            onCheckedChange={(checked) =>
                              setSafetyFeatures((prev) => ({ ...prev, shareTrip: checked }))
                            }
                          />
                          <Label htmlFor="share-trip">Share trip status with contacts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="record-audio"
                            checked={safetyFeatures.recordAudio}
                            onCheckedChange={(checked) =>
                              setSafetyFeatures((prev) => ({ ...prev, recordAudio: checked }))
                            }
                          />
                          <Label htmlFor="record-audio">Record audio during trip</Label>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

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

                    {(formData.rideType === "green" || formData.rideType === "carpool") && (
                      <Alert className="mt-4 bg-green-50 border-green-200">
                        <Leaf className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-600">Eco-friendly Choice</AlertTitle>
                        <AlertDescription className="text-green-700">
                          You'll save approximately {carbonSaved.toFixed(2)} kg of CO2 with this ride option!
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4" disabled={loading}>
                      {loading ? "Confirming..." : "Confirm Ride"}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-0 h-[600px]">
              <EnhancedMap
                pickup={pickupLocation || formData.pickup}
                destination={destinationLocation || formData.destination}
                showRoute={bookingStep === 2}
                onPickupSelect={handleMapPickupSelect}
                onDestinationSelect={handleMapDestinationSelect}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </RiderLayout>
  )
}

