"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PartyPopper, Heart, Coffee, Gamepad2, Bed, UtensilsCrossed } from "lucide-react"

interface YoloDayDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason?: string) => void
  date: Date
}

const yoloReasons = [
  { icon: PartyPopper, text: "Celebrating life!", color: "bg-pink-500 hover:bg-pink-600" },
  { icon: Heart, text: "Self-care day", color: "bg-red-500 hover:bg-red-600" },
  { icon: Coffee, text: "Too busy being awesome", color: "bg-amber-500 hover:bg-amber-600" },
  { icon: Gamepad2, text: "Gaming marathon", color: "bg-purple-500 hover:bg-purple-600" },
  { icon: Bed, text: "Feeling under the weather", color: "bg-blue-500 hover:bg-blue-600" },
  { icon: UtensilsCrossed, text: "Food adventure day", color: "bg-green-500 hover:bg-green-600" },
]

export function YoloDayDialog({ isOpen, onClose, onConfirm, date }: YoloDayDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [customReason, setCustomReason] = useState<string>("")

  const handleConfirm = () => {
    const reason = selectedReason || customReason || undefined
    onConfirm(reason)
    setSelectedReason("")
    setCustomReason("")
  }

  const handleClose = () => {
    onClose()
    setSelectedReason("")
    setCustomReason("")
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 justify-center mb-2">
            <PartyPopper className="h-6 w-6 text-pink-500" />
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              YOLO Day!
            </DialogTitle>
            <PartyPopper className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-center text-muted-foreground">
            Taking a break from tracking on <span className="font-semibold">{formatDate(date)}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No judgment, just vibes! ✨</h3>
            <p className="text-sm text-muted-foreground">
              Everyone needs a break sometimes. Your progress doesn't disappear because of one day!
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">What's the vibe today? (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {yoloReasons.map((reason, index) => {
                const Icon = reason.icon
                return (
                  <Button
                    key={index}
                    variant={selectedReason === reason.text ? "default" : "outline"}
                    size="sm"
                    className={`h-auto p-3 justify-start ${
                      selectedReason === reason.text 
                        ? `${reason.color} text-white` 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedReason(selectedReason === reason.text ? "" : reason.text)
                      setCustomReason("")
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="text-xs">{reason.text}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-reason" className="text-sm font-medium">
              Or write your own reason:
            </Label>
            <Textarea
              id="custom-reason"
              placeholder="Today I'm just living my best life... 🌟"
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value)
                setSelectedReason("")
              }}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-lg p-4 border">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Remember:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• One day doesn't define your journey</li>
              <li>• Rest and enjoyment are part of a healthy lifestyle</li>
              <li>• You can always come back tomorrow refreshed!</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Maybe Later
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          >
            <PartyPopper className="h-4 w-4 mr-2" />
            Declare YOLO Day!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}