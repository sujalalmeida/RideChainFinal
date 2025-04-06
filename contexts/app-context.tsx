"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Types
export type UserRole = "rider" | "driver" | null
export type RideStatus = "pending" | "accepted" | "arriving" | "in_progress" | "completed" | "rated"
export type RideType = "standard" | "premium" | "green" | "carpool"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  role: UserRole
  rating: number | null
  totalRides: number
  walletBalance: number
  carbonSaved?: number
  preferences?: {
    preferGreenRides?: boolean
    carpoolEnabled?: boolean
    favoriteLocations?: Location[]
    safetyFeatures?: string[]
  }
  communityId?: string
}

export interface Location {
  lat: number
  lng: number
  address: string
  name?: string
  isFavorite?: boolean
}

export interface Driver {
  id: string
  name: string
  rating: number | null
  avatar: string
  car: {
    model: string
    color: string
    plate: string
    isGreen?: boolean
    emissions?: number
  }
  safetyScore?: number
  languages?: string[]
}

export interface Community {
  id: string
  name: string
  members: string[]
  description: string
  rules?: string[]
  routes?: {
    from: Location
    to: Location
    schedule?: string
  }[]
}

export interface Ride {
  id: string
  date: string
  from: string | Location
  to: string | Location
  price: number
  status: RideStatus
  driver?: Driver
  rider?: {
    id: string
    name: string
    rating: number | null
    avatar: string
  }
  estimatedDistance?: string
  estimatedTime?: string
  rideType?: RideType
  carbonFootprint?: number
  carbonSaved?: number
  isCommunityRide?: boolean
  communityId?: string
  route?: {
    distance: string
    duration: string
    polyline?: string
  }
  safetyFeatures?: {
    shareTrip?: boolean
    recordAudio?: boolean
    emergencyContacts?: string[]
  }
}

interface AppContextType {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Ride state
  currentRide: Ride | null
  setCurrentRide: (ride: Ride | null) => void
  rides: Ride[]
  addRide: (ride: Ride) => void
  updateRideStatus: (rideId: string, status: RideStatus) => void

  // Driver state
  isDriverAvailable: boolean
  setIsDriverAvailable: (available: boolean) => void
  incomingRequests: Ride[]
  setIncomingRequests: (requests: Ride[]) => void

  // Community features
  communities: Community[]
  joinCommunity: (communityId: string) => void
  leaveCommunity: (communityId: string) => void
  createCommunity: (community: Omit<Community, "id">) => Promise<Community>

  // Carbon footprint
  getCarbonFootprint: (distance: number, rideType: RideType) => number
  getCarbonSaved: (distance: number, rideType: RideType) => number

  // Favorite locations
  favoriteLocations: Location[]
  addFavoriteLocation: (location: Location) => void
  removeFavoriteLocation: (locationId: string) => void

  // Actions
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  bookRide: (
    from: string | Location,
    to: string | Location,
    rideType: RideType,
    paymentMethod: string,
    options?: any,
  ) => Promise<Ride>
  acceptRideRequest: (rideId: string) => Promise<void>
  completeRide: (rideId: string) => Promise<void>
  rateRide: (rideId: string, rating: number, feedback?: string) => Promise<void>

  // Loading state
  loading: boolean
  setLoading: (loading: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // User state
  const [user, setUser] = useState<User | null>(null)

  // Ride state
  const [currentRide, setCurrentRide] = useState<Ride | null>(null)
  const [rides, setRides] = useState<Ride[]>([])

  // Driver state
  const [isDriverAvailable, setIsDriverAvailable] = useState(true)
  const [incomingRequests, setIncomingRequests] = useState<Ride[]>([])

  // Community features
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: "comm-001",
      name: "Tech Campus Commuters",
      members: ["user-001", "user-002", "user-003"],
      description: "Daily commuters to the tech campus",
      routes: [
        {
          from: { lat: 37.7749, lng: -122.4194, address: "Downtown" },
          to: { lat: 37.7937, lng: -122.3965, address: "Tech Park" },
          schedule: "Weekdays 8:00 AM",
        },
      ],
    },
    {
      id: "comm-002",
      name: "University Carpool",
      members: ["user-004", "user-005"],
      description: "Students and faculty carpooling to university",
      routes: [
        {
          from: { lat: 37.7833, lng: -122.4167, address: "City Center" },
          to: { lat: 37.8044, lng: -122.2711, address: "University" },
          schedule: "Mon/Wed/Fri 7:30 AM",
        },
      ],
    },
  ])

  // Favorite locations
  const [favoriteLocations, setFavoriteLocations] = useState<Location[]>([
    { lat: 37.7749, lng: -122.4194, address: "Home", name: "Home", isFavorite: true },
    { lat: 37.7937, lng: -122.3965, address: "Work", name: "Work", isFavorite: true },
  ])

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("ridechain_user")
    const storedRides = localStorage.getItem("ridechain_rides")
    const storedFavorites = localStorage.getItem("ridechain_favorites")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    if (storedRides) {
      setRides(JSON.parse(storedRides))
    }

    if (storedFavorites) {
      setFavoriteLocations(JSON.parse(storedFavorites))
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("ridechain_user", JSON.stringify(user))
    }

    localStorage.setItem("ridechain_rides", JSON.stringify(rides))
    localStorage.setItem("ridechain_favorites", JSON.stringify(favoriteLocations))
  }, [user, rides, favoriteLocations])

  // Add a new ride
  const addRide = (ride: Ride) => {
    setRides((prevRides) => [ride, ...prevRides])
  }

  // Update ride status
  const updateRideStatus = (rideId: string, status: RideStatus) => {
    setRides((prevRides) => prevRides.map((ride) => (ride.id === rideId ? { ...ride, status } : ride)))

    if (currentRide?.id === rideId) {
      setCurrentRide((prev) => (prev ? { ...prev, status } : null))
    }
  }

  // Login action
  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create mock user based on role
    const newUser: User = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name: role === "rider" ? "Alex Rivera" : "Michael Torres",
      email,
      phone: "+1 (555) 123-4567",
      avatar: "/placeholder.svg?height=60&width=60",
      role,
      rating: role === "rider" ? 4.9 : 4.8,
      totalRides: 0,
      walletBalance: role === "rider" ? 42.5 : 0,
      carbonSaved: 0,
      preferences: {
        preferGreenRides: true,
        carpoolEnabled: true,
        safetyFeatures: ["shareTrip", "recordAudio"],
      },
    }

    setUser(newUser)
    setLoading(false)

    // Redirect based on role
    router.push(role === "rider" ? "/rider/dashboard" : "/driver/dashboard")
  }

  // Logout action
  const logout = () => {
    setUser(null)
    setCurrentRide(null)
    localStorage.removeItem("ridechain_user")
    router.push("/")
  }

  // Update the bookRide function to handle real-time data better
  const bookRide = async (
    from: string | Location,
    to: string | Location,
    rideType: RideType,
    paymentMethod: string,
    options?: any,
  ): Promise<Ride> => {
    setLoading(true)

    // Simulate API call with a shorter delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Calculate price based on ride type and distance
    let price = 0
    let distance = 0
    let duration = 0

    // Calculate actual distance if we have coordinates
    if (typeof from !== "string" && typeof to !== "string") {
      // Calculate distance using Haversine formula
      const R = 6371e3 // Earth's radius in meters
      const φ1 = (from.lat * Math.PI) / 180 // φ, λ in radians
      const φ2 = (to.lat * Math.PI) / 180
      const Δφ = ((to.lat - from.lat) * Math.PI) / 180
      const Δλ = ((to.lng - from.lng) * Math.PI) / 180

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      distance = (R * c) / 1609.34 // Distance in miles
      duration = distance * 1.5 // Mock duration calculation
    } else {
      distance = 2.3 // Mock distance in miles
      duration = 12
    }

    switch (rideType) {
      case "standard":
        price = 5 + distance * 2
        break
      case "premium":
        price = 8 + distance * 3
        break
      case "green":
        price = 6 + distance * 2.5
        break
      case "carpool":
        price = 4 + distance * 1.5
        break
      default:
        price = 5 + distance * 2
    }

    // Calculate carbon footprint and savings
    const carbonFootprint = getCarbonFootprint(distance, rideType)
    const carbonSaved = getCarbonSaved(distance, rideType)

    // Create new ride
    const newRide: Ride = {
      id: `ride-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toLocaleString(),
      from,
      to,
      price,
      status: "accepted",
      rideType,
      carbonFootprint,
      carbonSaved,
      driver: {
        id: `driver-${Math.random().toString(36).substr(2, 9)}`,
        name: "Michael T.",
        rating: 4.8,
        avatar: "/placeholder.svg?height=60&width=60",
        car: {
          model: rideType === "green" ? "Tesla Model 3" : "Toyota Camry",
          color: rideType === "green" ? "Blue" : "Silver",
          plate: "ABC 123",
          isGreen: rideType === "green",
        },
        safetyScore: 98,
      },
      estimatedDistance: `${distance.toFixed(1)} miles`,
      estimatedTime: `${duration.toFixed(0)} min`,
      isCommunityRide: rideType === "carpool",
      route: {
        distance: `${distance.toFixed(1)} miles`,
        duration: `${duration.toFixed(0)} min`,
      },
      safetyFeatures: options?.safetyFeatures || {
        shareTrip: true,
        recordAudio: false,
        emergencyContacts: [],
      },
    }

    // Update user's carbon saved if it's a green ride
    if (user && (rideType === "green" || rideType === "carpool")) {
      setUser({
        ...user,
        carbonSaved: (user.carbonSaved || 0) + carbonSaved,
      })
    }

    setCurrentRide(newRide)
    addRide(newRide)
    setLoading(false)

    return newRide
  }

  // Accept ride request action (for drivers)
  const acceptRideRequest = async (rideId: string) => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update ride status
    updateRideStatus(rideId, "accepted")

    // Remove from incoming requests
    setIncomingRequests((prev) => prev.filter((request) => request.id !== rideId))

    // Set as current ride
    const acceptedRide = incomingRequests.find((request) => request.id === rideId)
    if (acceptedRide) {
      setCurrentRide(acceptedRide)
    }

    setLoading(false)
  }

  // Complete ride action
  const completeRide = async (rideId: string) => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update ride status
    updateRideStatus(rideId, "completed")

    // Update user stats
    if (user) {
      const completedRide = rides.find((ride) => ride.id === rideId)
      if (completedRide) {
        // Update total rides
        const updatedUser = {
          ...user,
          totalRides: user.totalRides + 1,
        }

        // Update wallet balance for drivers
        if (user.role === "driver") {
          updatedUser.walletBalance = user.walletBalance + completedRide.price * 0.8 // Driver gets 80% of fare
        }

        // Update carbon saved
        if (completedRide.carbonSaved) {
          updatedUser.carbonSaved = (updatedUser.carbonSaved || 0) + completedRide.carbonSaved
        }

        setUser(updatedUser)
      }
    }

    setLoading(false)
  }

  // Rate ride action
  const rateRide = async (rideId: string, rating: number, feedback?: string) => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Update ride status
    updateRideStatus(rideId, "rated")

    // Clear current ride
    setCurrentRide(null)

    setLoading(false)
  }

  // Carbon footprint calculation
  const getCarbonFootprint = (distance: number, rideType: RideType): number => {
    // Average CO2 emissions in kg per mile
    switch (rideType) {
      case "standard":
        return distance * 0.35
      case "premium":
        return distance * 0.45
      case "green":
        return distance * 0.05
      case "carpool":
        return (distance * 0.35) / 3 // Assume 3 passengers
      default:
        return distance * 0.35
    }
  }

  // Carbon saved calculation (compared to standard ride)
  const getCarbonSaved = (distance: number, rideType: RideType): number => {
    const standardEmissions = distance * 0.35
    const actualEmissions = getCarbonFootprint(distance, rideType)
    return Math.max(0, standardEmissions - actualEmissions)
  }

  // Add favorite location
  const addFavoriteLocation = (location: Location) => {
    setFavoriteLocations((prev) => [...prev, { ...location, isFavorite: true }])
  }

  // Remove favorite location
  const removeFavoriteLocation = (address: string) => {
    setFavoriteLocations((prev) => prev.filter((loc) => loc.address !== address))
  }

  // Join community
  const joinCommunity = (communityId: string) => {
    if (!user) return

    setCommunities((prev) =>
      prev.map((community) =>
        community.id === communityId ? { ...community, members: [...community.members, user.id] } : community,
      ),
    )

    setUser({
      ...user,
      communityId,
    })
  }

  // Leave community
  const leaveCommunity = (communityId: string) => {
    if (!user) return

    setCommunities((prev) =>
      prev.map((community) =>
        community.id === communityId
          ? { ...community, members: community.members.filter((id) => id !== user.id) }
          : community,
      ),
    )

    setUser({
      ...user,
      communityId: undefined,
    })
  }

  // Create community
  const createCommunity = async (community: Omit<Community, "id">): Promise<Community> => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newCommunity: Community = {
      ...community,
      id: `comm-${Math.random().toString(36).substr(2, 9)}`,
    }

    setCommunities((prev) => [...prev, newCommunity])

    setLoading(false)
    return newCommunity
  }

  const contextValue: AppContextType = {
    user,
    setUser,
    currentRide,
    setCurrentRide,
    rides,
    addRide,
    updateRideStatus,
    isDriverAvailable,
    setIsDriverAvailable,
    incomingRequests,
    setIncomingRequests,
    communities,
    joinCommunity,
    leaveCommunity,
    createCommunity,
    getCarbonFootprint,
    getCarbonSaved,
    favoriteLocations,
    addFavoriteLocation,
    removeFavoriteLocation,
    login,
    logout,
    bookRide,
    acceptRideRequest,
    completeRide,
    rateRide,
    loading,
    setLoading,
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

