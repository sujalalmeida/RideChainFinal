import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { 
  ArrowRight, 
  Car, 
  MapPin, 
  Shield, 
  Star, 
  Wallet, 
  Brain, 
  Sparkles, 
  Zap, 
  LineChart, 
  BrainCircuit,
  MessageSquare,
  BarChart,
  Leaf,
  Clock,
  TriangleAlert
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
            <Link href="#ai-features" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              AI Integration
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
                <Badge className="w-fit px-4 py-1 text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Powered by Gemini AI
                </Badge>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your Journey, <span className="text-indigo-600">Simplified</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Book rides, track journeys, and enjoy AI-powered insights. RideChain makes transportation smarter,
                    safer, and more efficient.
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
              <div className="flex justify-center lg:justify-end">
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src="/placeholder.jpg"
                    alt="RideChain App"
                    width={500}
                    height={400}
                    className="object-cover"
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <p className="text-xs text-white font-medium">AI-Powered Route Analysis Active</p>
                    </div>
                  </div>
                </div>
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
              <Card className="border-2 hover:border-indigo-100 transition-all duration-300 hover:shadow-md">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <MapPin className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Easy Booking</h3>
                  <p className="text-center text-gray-500">
                    Book rides with just a few taps. Set your pickup and destination in seconds.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-indigo-100 transition-all duration-300 hover:shadow-md">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Car className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Ride Tracking</h3>
                  <p className="text-center text-gray-500">
                    Track your ride in real-time with AI-enhanced ETA and route information.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-indigo-100 transition-all duration-300 hover:shadow-md">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Star className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Ratings & Reviews</h3>
                  <p className="text-center text-gray-500">
                    Rate your experience and help build a trusted community of riders and drivers.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-indigo-100 transition-all duration-300 hover:shadow-md">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Wallet className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Seamless Payments</h3>
                  <p className="text-center text-gray-500">
                    Multiple payment options with transparent fare estimates and receipts.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-indigo-100 transition-all duration-300 hover:shadow-md">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Shield className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Safety First</h3>
                  <p className="text-center text-gray-500">
                    AI-powered monitoring, emergency features, and secure ride tracking to keep you safe.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-indigo-100 transition-all duration-300 hover:shadow-md">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <BrainCircuit className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl font-bold">Smart Insights</h3>
                  <p className="text-center text-gray-500">
                    Get AI-powered travel recommendations, efficiency analysis, and personalized tips.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="ai-features" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <Badge className="px-4 py-1 text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Gemini AI Integration
              </Badge>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Intelligent Ride <span className="text-indigo-600">Experiences</span>
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  RideChain leverages Google's Gemini AI to create smarter, more personalized journeys
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="rounded-full bg-indigo-100 p-3">
                  <BarChart className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold">Ride Efficiency Analysis</h3>
                <p className="text-gray-500">
                  Get detailed insights about your journey's efficiency with AI-generated scores and recommendations for time, cost, and sustainability.
                </p>
              </div>

              <div className="flex flex-col items-start space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="rounded-full bg-green-100 p-3">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Sustainability Tracking</h3>
                <p className="text-gray-500">
                  Track your carbon footprint and receive suggestions for more environmentally friendly ride options.
                </p>
              </div>

              <div className="flex flex-col items-start space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="rounded-full bg-blue-100 p-3">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Travel Tips</h3>
                <p className="text-gray-500">
                  Receive personalized recommendations based on your ride history, preferences, and current travel patterns.
                </p>
              </div>

              <div className="flex flex-col items-start space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="rounded-full bg-amber-100 p-3">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold">Route Optimization</h3>
                <p className="text-gray-500">
                  AI analyzes traffic patterns, weather conditions, and historical data to suggest the most efficient routes.
                </p>
              </div>

              <div className="flex flex-col items-start space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="rounded-full bg-purple-100 p-3">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Weather Insights</h3>
                <p className="text-gray-500">
                  Get real-time weather updates for your journey with AI-generated recommendations based on conditions.
                </p>
              </div>

              <div className="flex flex-col items-start space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="rounded-full bg-red-100 p-3">
                  <TriangleAlert className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">AI Safety Monitoring</h3>
                <p className="text-gray-500">
                  Advanced security features powered by AI, including route deviation detection and emergency assistance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A simple process for a smooth ride experience
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <span className="font-bold">1</span>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-bold">Enter Your Destination</h3>
                  <p className="text-gray-500">
                    Simply input your pickup location and destination, and let our AI suggest the optimal route.
                  </p>
                </div>
                <div className="absolute hidden md:block right-0 top-6 h-0.5 w-full max-w-[calc(33.33%-3rem)] bg-gray-200"></div>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <span className="font-bold">2</span>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-bold">Select Your Ride</h3>
                  <p className="text-gray-500">
                    Choose from AI-recommended ride options based on your preferences for comfort, cost, and sustainability.
                  </p>
                </div>
                <div className="absolute hidden md:block right-0 top-6 h-0.5 w-full max-w-[calc(33.33%-3rem)] bg-gray-200"></div>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <span className="font-bold">3</span>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-bold">Enjoy Your Journey</h3>
                  <p className="text-gray-500">
                    Track your ride with real-time updates, AI insights, and safety monitoring throughout your journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="safety" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-indigo-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col space-y-4">
                <Badge className="w-fit px-4 py-1 text-sm bg-red-100 text-red-800 hover:bg-red-100">
                  <Shield className="mr-1 h-3.5 w-3.5" />
                  Safety First
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Your Security is Our Priority</h2>
                  <p className="text-gray-500 md:text-xl">
                    RideChain features comprehensive safety measures powered by AI to ensure secure journeys for every rider.
                  </p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold">AI-Powered Safety Monitoring</h3>
                      <p className="text-gray-500">Real-time route monitoring and deviation alerts.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold">Emergency Assistance</h3>
                      <p className="text-gray-500">One-tap emergency contact with intelligent response.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold">Driver Verification</h3>
                      <p className="text-gray-500">Extensive background checks and continuous monitoring.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold">Fraud Prevention</h3>
                      <p className="text-gray-500">AI systems to detect and prevent fraudulent activity.</p>
                    </div>
                  </li>
                </ul>
                <Link href="/auth/register">
                  <Button size="lg" className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                    Get Started Safely
                  </Button>
                </Link>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative overflow-hidden rounded-xl shadow-2xl">
                  <Image
                    src="/placeholder.jpg"
                    alt="Safety Features"
                    width={500}
                    height={400}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white/90 p-6 rounded-lg max-w-xs text-center">
                      <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
                      <h3 className="text-lg font-bold mb-1">Safety Center</h3>
                      <p className="text-sm text-gray-600">Access AI-powered security features through our dedicated Safety Center</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-indigo-600">
          <div className="container px-4 md:px-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Ready to Start Your Journey?
              </h2>
              <p className="max-w-[600px] text-indigo-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of satisfied riders experiencing the future of transportation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 min-[400px]:flex-row">
                <Link href="/auth/register?role=rider">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                    Start Riding Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/register?role=driver">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-indigo-700">
                    Become a Driver
                  </Button>
                </Link>
              </div>
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
            <div className="flex gap-2 mt-2">
              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                <Sparkles className="mr-1 h-3 w-3" />
                Gemini AI Powered
              </Badge>
            </div>
          </div>
          <nav className="md:ml-auto grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Platform</h3>
              <Link href="#how-it-works" className="text-sm text-gray-500 hover:text-indigo-600">
                How it works
              </Link>
              <Link href="#features" className="text-sm text-gray-500 hover:text-indigo-600">
                Features
              </Link>
              <Link href="#ai-features" className="text-sm text-gray-500 hover:text-indigo-600">
                AI Integration
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

