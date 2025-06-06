"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PartyPopper, RotateCcw, Sparkles } from "lucide-react"
import type { YoloDay } from "@/types/database"

interface YoloDayDisplayProps {
  yoloDay: YoloDay
  onRemove: () => void
  date: Date
}

const celebratoryEmojis = ["🎉", "✨", "🌟", "🎊", "💫", "🚀", "🦄", "🌈"]
const getRandomEmoji = () => celebratoryEmojis[Math.floor(Math.random() * celebratoryEmojis.length)]

export function YoloDayDisplay({ yoloDay, onRemove, date }: YoloDayDisplayProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 dark:from-pink-500/20 dark:via-purple-500/20 dark:to-blue-500/20">
      <CardContent className="p-8 text-center space-y-6">
        {/* Header with fun animation */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <PartyPopper className="h-8 w-8 text-pink-500 animate-bounce" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              YOLO DAY!
            </h2>
            <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
          </div>
          
          <Badge 
            variant="secondary" 
            className="text-lg px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
          >
            {formatDate(date)}
          </Badge>
        </div>

        {/* Fun messaging */}
        <div className="space-y-4">
          <p className="text-2xl font-semibold">
            You're living your best life today! {getRandomEmoji()}
          </p>
          
          {yoloDay.reason && (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
              <p className="text-sm text-muted-foreground mb-1">Today's vibe:</p>
              <p className="font-medium text-lg">"{yoloDay.reason}"</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 space-y-3 border border-gray-700">
            <h3 className="font-semibold text-lg flex items-center gap-2 justify-center text-white">
              <Sparkles className="h-5 w-5 text-purple-500" />
              No tracking, no stress, just vibes
            </h3>
            <div className="text-gray-300 space-y-2">
              <p className="text-sm">
                🌟 Rest and enjoyment are part of a healthy lifestyle
              </p>
              <p className="text-sm">
                💪 Your progress doesn't disappear because of one day
              </p>
              <p className="text-sm">
                ✨ Tomorrow is a fresh start whenever you're ready
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={onRemove}
            className="group hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
            Back to Tracking
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-4xl opacity-20 animate-spin-slow">
          🎉
        </div>
        <div className="absolute bottom-4 left-4 text-3xl opacity-20 animate-bounce">
          ✨
        </div>
      </CardContent>
    </Card>
  )
}