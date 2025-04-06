"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Award, Gift, Leaf, Medal, Star, Trophy, Users, Zap } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"

interface RewardsSystemProps {
  className?: string
}

export function RewardsSystem({ className }: RewardsSystemProps) {
  const { user } = useAppContext()
  const [activeTab, setActiveTab] = useState("rewards")

  // User's rewards data
  const rewardsData = {
    points: 1250,
    level: 3,
    nextLevelPoints: 2000,
    streaks: {
      current: 5,
      longest: 12,
    },
    badges: [
      {
        id: "eco-warrior",
        name: "Eco Warrior",
        icon: Leaf,
        description: "Completed 10 green rides",
        earned: true,
        progress: 100,
      },
      {
        id: "punctual",
        name: "Punctuality Pro",
        icon: Zap,
        description: "Always on time for 15 rides",
        earned: true,
        progress: 100,
      },
      {
        id: "social",
        name: "Social Rider",
        icon: Users,
        description: "Completed 5 carpool rides",
        earned: true,
        progress: 100,
      },
      {
        id: "explorer",
        name: "City Explorer",
        icon: Award,
        description: "Visited 10 different neighborhoods",
        earned: false,
        progress: 70,
      },
      {
        id: "night-owl",
        name: "Night Owl",
        icon: Star,
        description: "Completed 8 rides after 10 PM",
        earned: false,
        progress: 50,
      },
    ],
    rewards: [
      { id: "discount-10", name: "10% Off Next Ride", points: 500, claimed: false, expires: "May 10, 2025" },
      { id: "free-ride", name: "Free Ride (up to $15)", points: 1500, claimed: false, expires: "No expiration" },
      { id: "priority", name: "Priority Matching", points: 800, claimed: false, expires: "No expiration" },
      { id: "airport", name: "Airport Ride Upgrade", points: 1200, claimed: false, expires: "No expiration" },
    ],
    challenges: [
      {
        id: "weekly-1",
        name: "Weekly Challenge",
        description: "Complete 5 rides this week",
        progress: 3,
        total: 5,
        reward: 200,
        expires: "Sunday, April 13, 2025",
      },
      {
        id: "eco-1",
        name: "Green Commuter",
        description: "Take 3 green rides this month",
        progress: 2,
        total: 3,
        reward: 150,
        expires: "April 30, 2025",
      },
      {
        id: "community-1",
        name: "Community Builder",
        description: "Join a community ride",
        progress: 0,
        total: 1,
        reward: 100,
        expires: "April 30, 2025",
      },
    ],
    leaderboard: [
      { rank: 1, name: "Sarah J.", points: 3450, avatar: "/placeholder.svg?height=40&width=40" },
      { rank: 2, name: "Michael T.", points: 3120, avatar: "/placeholder.svg?height=40&width=40" },
      { rank: 3, name: "David L.", points: 2840, avatar: "/placeholder.svg?height=40&width=40" },
      {
        rank: 4,
        name: "Alex Rivera",
        points: 1250,
        avatar: user?.avatar || "/placeholder.svg?height=40&width=40",
        isUser: true,
      },
      { rank: 5, name: "Jessica K.", points: 1180, avatar: "/placeholder.svg?height=40&width=40" },
    ],
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Rewards & Achievements</CardTitle>
              <CardDescription>Earn points, complete challenges, and unlock rewards</CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span className="text-xl font-bold">{rewardsData.points} points</span>
              </div>
              <span className="text-sm text-muted-foreground">Level {rewardsData.level}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6 pb-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Level {rewardsData.level}</span>
                <span>Level {rewardsData.level + 1}</span>
              </div>
              <Progress value={(rewardsData.points / rewardsData.nextLevelPoints) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {rewardsData.nextLevelPoints - rewardsData.points} points to next level
              </p>
            </div>
          </div>

          <Tabs defaultValue="rewards" className="w-full" onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="rewards" className="p-6 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Available Rewards</h3>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Gift className="h-3 w-3" /> {rewardsData.points} points available
                </Badge>
              </div>

              <div className="grid gap-4">
                {rewardsData.rewards.map((reward) => (
                  <Card key={reward.id} className="overflow-hidden">
                    <div
                      className={`h-1 ${reward.points <= rewardsData.points ? "bg-green-500" : "bg-gray-200"}`}
                    ></div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{reward.name}</h4>
                          <p className="text-sm text-muted-foreground">Expires: {reward.expires}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {reward.points} points
                          </Badge>
                          <Button
                            size="sm"
                            disabled={reward.points > rewardsData.points}
                            className={reward.points <= rewardsData.points ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                          >
                            Redeem
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">How to Earn Points</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">+10 points</Badge>
                    <span>Complete a ride</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">+5 points</Badge>
                    <span>Rate your driver</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+15 points</Badge>
                    <span>Choose a green ride</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">+20 points</Badge>
                    <span>Complete a carpool ride</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">+25 points</Badge>
                    <span>Maintain a 5-day streak</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="badges" className="p-6 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Your Badges</h3>
                <Badge variant="outline">
                  {rewardsData.badges.filter((b) => b.earned).length}/{rewardsData.badges.length} Earned
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {rewardsData.badges.map((badge) => (
                  <Card key={badge.id} className={`overflow-hidden ${!badge.earned ? "opacity-70" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            badge.earned ? "bg-indigo-100" : "bg-gray-100"
                          }`}
                        >
                          <badge.icon className={`h-6 w-6 ${badge.earned ? "text-indigo-600" : "text-gray-400"}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium flex items-center gap-2">
                            {badge.name}
                            {badge.earned && <Trophy className="h-4 w-4 text-amber-500" />}
                          </h4>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                          {!badge.earned && (
                            <div className="mt-2">
                              <Progress value={badge.progress} className="h-1" />
                              <p className="text-xs text-muted-foreground mt-1">{badge.progress}% complete</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="p-6 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Active Challenges</h3>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {rewardsData.challenges.length} active
                </Badge>
              </div>

              <div className="space-y-4">
                {rewardsData.challenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{challenge.name}</h4>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          </div>
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                            +{challenge.reward} points
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>
                              {challenge.progress}/{challenge.total} completed
                            </span>
                            <span className="text-xs text-muted-foreground">Expires: {challenge.expires}</span>
                          </div>
                          <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Streaks</h3>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {rewardsData.streaks.current} day streak
                </Badge>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Current Streak</h4>
                      <p className="text-sm text-muted-foreground">Keep using RideChain to maintain your streak</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-500">{rewardsData.streaks.current}</div>
                      <div className="text-xs text-muted-foreground">days</div>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Longest streak</span>
                    <span className="font-medium">{rewardsData.streaks.longest} days</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="p-6 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Top Riders This Month</h3>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Your Rank: #
                  {rewardsData.leaderboard.find((item) => item.isUser)?.rank || "-"}
                </Badge>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {rewardsData.leaderboard.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 ${item.isUser ? "bg-indigo-50" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8">
                            {item.rank <= 3 ? (
                              <Medal
                                className={`h-6 w-6 ${
                                  item.rank === 1
                                    ? "text-yellow-500"
                                    : item.rank === 2
                                      ? "text-gray-400"
                                      : "text-amber-700"
                                }`}
                              />
                            ) : (
                              <span className="text-sm font-medium">{item.rank}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                              <img
                                src={item.avatar || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium">{item.name}</span>
                            {item.isUser && (
                              <Badge className="ml-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-100">You</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span className="font-medium">{item.points}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center p-4">
                  <Button variant="outline">View Full Leaderboard</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

