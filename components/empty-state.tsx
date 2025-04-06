import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-8 flex flex-col items-center justify-center">
        <div className="mb-4 text-muted-foreground">{icon}</div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <CardDescription className="text-center mb-4">{description}</CardDescription>
        {action}
      </CardContent>
    </Card>
  )
}

