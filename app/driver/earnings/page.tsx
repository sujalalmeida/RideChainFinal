"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DriverLayout } from "@/components/layouts/driver-layout"
import { BanknoteIcon as BankIcon, Calendar, DollarSign, Download, TrendingUp } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// Add router import
import { useRouter } from "next/navigation"

// Mock earnings data
const weeklyEarnings = [
  { day: "Mon", amount: 45.75 },
  { day: "Tue", amount: 62.5 },
  { day: "Wed", amount: 38.25 },
  { day: "Thu", amount: 55.0 },
  { day: "Fri", amount: 85.75 },
  { day: "Sat", amount: 95.5 },
  { day: "Sun", amount: 75.25 },
]

const monthlyEarnings = [
  { month: "Jan", amount: 1250.75 },
  { month: "Feb", amount: 1425.5 },
  { month: "Mar", amount: 1575.25 },
  { month: "Apr", amount: 458.0 }, // Current month (partial)
]

// Mock earnings breakdown
const earningsBreakdown = {
  base: 325.5,
  tips: 45.75,
  bonuses: 25.0,
  total: 396.25,
  rides: 28,
  hours: 24.5,
  avgPerRide: 14.15,
  avgPerHour: 16.17,
}

export default function DriverEarningsPage() {
  const { user } = useAppContext()
  const [timeframe, setTimeframe] = useState("week")
  const router = useRouter() // Initialize useRouter here

  // Add this useEffect hook inside the component, right after the useState declarations
  useEffect(() => {
    if (!user) {
      // Redirect to login if no user is found
      router.push("/auth/login")
    }
  }, [user, router])

  if (!user) {
    return (
      <DriverLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DriverLayout>
    )
  }

  return (
    <DriverLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
            <p className="text-muted-foreground">Track and manage your earnings</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earningsBreakdown.total.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {timeframe === "week" ? "This week" : timeframe === "month" ? "This month" : "This year"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earningsBreakdown.rides}</div>
              <p className="text-xs text-muted-foreground">
                {timeframe === "week" ? "This week" : timeframe === "month" ? "This month" : "This year"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Per Ride</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earningsBreakdown.avgPerRide.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {timeframe === "week" ? "This week" : timeframe === "month" ? "This month" : "This year"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <BankIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${user.walletBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Earnings Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Earnings Breakdown</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Chart</CardTitle>
                <CardDescription>
                  {timeframe === "week"
                    ? "Your earnings for this week"
                    : timeframe === "month"
                      ? "Your earnings for this month"
                      : "Your earnings for this year"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  {/* This would be a chart in a real implementation */}
                  <div className="h-full flex flex-col">
                    <div className="flex-1 flex items-end gap-2">
                      {timeframe === "week"
                        ? // Weekly earnings bars
                          weeklyEarnings.map((day, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                              <div
                                className="w-full bg-gray-100 rounded-t-md relative"
                                style={{
                                  height: `${(day.amount / Math.max(...weeklyEarnings.map((d) => d.amount))) * 100}%`,
                                  minHeight: "20px",
                                }}
                              >
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-md"
                                  style={{
                                    height: `${(day.amount / Math.max(...weeklyEarnings.map((d) => d.amount))) * 100}%`,
                                  }}
                                ></div>
                                <div className="absolute -top-6 left-0 right-0 text-center text-sm font-medium">
                                  ${day.amount.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-sm font-medium">{day.day}</div>
                            </div>
                          ))
                        : // Monthly earnings bars
                          monthlyEarnings.map((month, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                              <div
                                className="w-full bg-gray-100 rounded-t-md relative"
                                style={{
                                  height: `${(month.amount / Math.max(...monthlyEarnings.map((m) => m.amount))) * 100}%`,
                                  minHeight: "20px",
                                }}
                              >
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-md"
                                  style={{
                                    height: `${(month.amount / Math.max(...monthlyEarnings.map((m) => m.amount))) * 100}%`,
                                  }}
                                ></div>
                                <div className="absolute -top-6 left-0 right-0 text-center text-sm font-medium">
                                  ${month.amount.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-sm font-medium">{month.month}</div>
                            </div>
                          ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>Detailed breakdown of your earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Earnings Components</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Base Fare</span>
                            <span className="font-medium">${earningsBreakdown.base.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tips</span>
                            <span className="font-medium">${earningsBreakdown.tips.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Bonuses & Incentives</span>
                            <span className="font-medium">${earningsBreakdown.bonuses.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="font-medium">Total Earnings</span>
                            <span className="font-bold">${earningsBreakdown.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Hours</span>
                            <span className="font-medium">{earningsBreakdown.hours} hrs</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Rides</span>
                            <span className="font-medium">{earningsBreakdown.rides}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Average Per Hour</span>
                            <span className="font-medium">${earningsBreakdown.avgPerHour.toFixed(2)}/hr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Average Per Ride</span>
                            <span className="font-medium">${earningsBreakdown.avgPerRide.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Earnings by Time of Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-end gap-2">
                        {/* Mock time of day earnings chart */}
                        {["Morning", "Afternoon", "Evening", "Night"].map((time, index) => {
                          const heights = [65, 40, 85, 55]
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                              <div
                                className="w-full bg-gray-100 rounded-t-md relative"
                                style={{ height: `${heights[index]}%` }}
                              >
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-md"
                                  style={{ height: `${heights[index]}%` }}
                                ></div>
                                <div className="absolute -top-6 left-0 right-0 text-center text-sm font-medium">
                                  ${((earningsBreakdown.total * heights[index]) / 100).toFixed(2)}
                                </div>
                              </div>
                              <div className="text-sm font-medium">{time}</div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>History of your earnings and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Weekly Earnings</p>
                      <p className="text-sm text-muted-foreground">Apr 1 - Apr 7, 2025</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600">+$458.00</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Withdrawal to Bank Account</p>
                      <p className="text-sm text-muted-foreground">Apr 1, 2025</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">-$350.00</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Weekly Earnings</p>
                      <p className="text-sm text-muted-foreground">Mar 25 - Mar 31, 2025</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600">+$512.75</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Withdrawal to Bank Account</p>
                      <p className="text-sm text-muted-foreground">Mar 24, 2025</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">-$400.00</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">Weekly Earnings</p>
                      <p className="text-sm text-muted-foreground">Mar 18 - Mar 24, 2025</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600">+$485.25</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline">View All Payments</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DriverLayout>
  )
}

