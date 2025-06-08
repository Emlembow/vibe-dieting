"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface YoloDayDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason?: string) => void
  date: Date
}

export function YoloDayDialog({ isOpen, onClose, onConfirm, date }: YoloDayDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] border-2 border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">
            Take a YOLO Day?
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm">
            {formatDate(date)}
          </p>
        </DialogHeader>

        <div className="py-8 text-center">
          <div className="relative inline-block">
            <Star className="h-16 w-16 mx-auto text-purple-500 fill-purple-500 animate-pulse" />
            <div className="absolute inset-0 blur-xl bg-purple-500/30 rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Skip tracking for today. No judgment, just vibes ✨
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            Let's Go! 🎉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}