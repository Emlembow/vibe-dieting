"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, RotateCcw, Sparkles } from "lucide-react"
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
    <Card className="border-2 border-dashed border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5">
      <CardContent className="p-8 text-center space-y-6">
        <div className="space-y-3">
          <div className="relative inline-block">
            <Star className="h-12 w-12 mx-auto text-purple-500 fill-purple-500" />
            <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-pink-500 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            YOLO Day Active! 🎉
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(date)}
          </p>
        </div>

        <p className="text-base text-muted-foreground">
          Taking a break from tracking today. Living in the moment ✨
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="border-purple-500/20 hover:bg-purple-500/10"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resume Tracking
        </Button>
      </CardContent>
    </Card>
  )
}