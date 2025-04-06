import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Car, MapPin, Shield, Star, Wallet } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold">RideChain</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              How It Works
            </Link>
            <Link href="#safety" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Safety
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-indigo-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your Journey, <span className="text-indigo-600">Simplified</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Book rides, track journeys, and connect with reliable drivers. RideChain makes transportation easy,
                    safe, and affordable.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth/register?role=rider">
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                      Ride Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/register?role=driver">
                    <Button size="lg" variant="outline">
                      Become a Driver
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="RideChain App"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need for a seamless ride-sharing experience
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <MapPin className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Easy Booking</h3>
                  <p className="text-center text-gray-500">
                    Book rides with just a few taps. Set your pickup and destination in seconds.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Car className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Ride Tracking</h3>
                  <p className="text-center text-gray-500">
                    Track your ride in real-time with accurate ETA and driver information.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Star className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Ratings & Reviews</h3>
                  <p className="text-center text-gray-500">
                    Rate your experience and help build a trusted community of riders and drivers.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Wallet className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Seamless Payments</h3>
                  <p className="text-center text-gray-500">
                    Multiple payment options with transparent fare estimates and receipts.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Shield className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Safety First</h3>
                  <p className="text-center text-gray-500">
                    Emergency features, trusted drivers, and secure ride monitoring.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Car className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Driver Tools</h3>
                  <p className="text-center text-gray-500">
                    Comprehensive tools for drivers to manage rides and maximize earnings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-indigo-600" />
              <span className="text-lg font-bold">RideChain</span>
            </div>
            <p className="text-sm text-gray-500">Modern ride-sharing platform</p>
          </div>
          <nav className="md:ml-auto grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Platform</h3>
              <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                How it works
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                Features
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                Pricing
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Company</h3>
              <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                About
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                Careers
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                Contact
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Legal</h3>
              <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                Terms
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-indigo-600">
                Cookie Policy
              </Link>
            </div>
          </nav>
        </div>
        <div className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-gray-500">© 2025 RideChain. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-gray-500 hover:text-indigo-600">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-gray-500 hover:text-indigo-600">
                Terms of Service
              </Link>
              <Link href="#" className="text-xs text-gray-500 hover:text-indigo-600">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

