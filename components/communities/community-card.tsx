"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, MapPin } from "lucide-react"
import type { Community } from "@/contexts/app-context"

interface CommunityCardProps {
  community: Community
  isMember?: boolean
  onJoin?: (communityId: string) => void
  onLeave?: (communityId: string) => void
}

export function CommunityCard({ community, isMember, onJoin, onLeave }: CommunityCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{community.name}</CardTitle>
            <CardDescription>{community.description}</CardDescription>
          </div>
          {isMember && <Badge>Member</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{community.members.length} members</span>
        </div>

        {community.routes && community.routes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Common Routes</h3>
            {community.routes.map((route, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-indigo-600" />
                      <span className="text-sm font-medium">
                        {route.from.address} → {route.to.address}
                      </span>
                    </div>
                    {route.schedule && (
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{route.schedule}</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isMember ? (
          <Button variant="outline" className="w-full" onClick={() => onLeave && onLeave(community.id)}>
            Leave Community
          </Button>
        ) : (
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => onJoin && onJoin(community.id)}>
            Join Community
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

