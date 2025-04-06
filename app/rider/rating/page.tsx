"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RiderLayout } from "@/components/layouts/rider-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Check, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/app-context"

export default function RatingPage() {
  const router = useRouter()
  const { currentRide, rateRide, loading } = useAppContext()
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // Redirect if no current ride
  useEffect(() => {
    if (!currentRide || currentRide.status === "rated") {
      router.push("/rider/dashboard")
    }
  }, [currentRide, router])

  const handleSubmit = async () => {
    if (!currentRide || rating === 0) return

    try {
      await rateRide(currentRide.id, rating, feedback)
      setSubmitted(true)

      // Redirect after a delay
      setTimeout(() => {
        router.push("/rider/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error rating ride:", error)
    }
  }

  // If no current ride, show loading or redirect
  if (!currentRide) {
    return (
      <RiderLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </RiderLayout>
    )
  }

  return (
    <RiderLayout>
      <div className="flex flex-col items-center justify-center max-w-md mx-auto py-8">
        {!submitted ? (
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Rate Your Ride</CardTitle>
              <CardDescription>Your feedback helps improve our service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentRide.driver && (
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={currentRide.driver.avatar} alt={currentRide.driver.name} />
                    <AvatarFallback>{currentRide.driver.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-medium">{currentRide.driver.name}</h3>
                    <p className="text-sm text-muted-foreground">Your driver</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">How was your ride?</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="rounded-full p-1 transition-all"
                    >
                      <Star
                        className={`h-8 w-8 ${rating >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium">
                  Additional feedback (optional)
                </label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us about your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium">Ride Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">From:</span>
                  <span>{currentRide.from}</span>
                  <span className="text-muted-foreground">To:</span>
                  <span>{currentRide.to}</span>
                  <span className="text-muted-foreground">Date:</span>
                  <span>{currentRide.date}</span>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">${currentRide.price.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={rating === 0 || loading}
                onClick={handleSubmit}
              >
                {loading ? "Submitting..." : "Submit Rating"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl mt-4">Thank You!</CardTitle>
              <CardDescription>Your rating has been submitted successfully</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                We appreciate your feedback. You'll be redirected to the dashboard shortly.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RiderLayout>
  )
}

