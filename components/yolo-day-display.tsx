"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, RotateCcw } from "lucide-react"
import type { YoloDay } from "@/types/database"

interface YoloDayDisplayProps {
  yoloDay: YoloDay
  onRemove: () => void
  date: Date
}

export function YoloDayDisplay({ yoloDay, onRemove, date }: YoloDayDisplayProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-6 text-center space-y-4">
        <div className="space-y-2">
          <Star className="h-8 w-8 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">YOLO Day</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(date)}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Taking a break from tracking today
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resume Tracking
        </Button>
      </CardContent>
    </Card>
  )
}