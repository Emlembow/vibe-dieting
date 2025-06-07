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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            Take a YOLO Day?
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm">
            {formatDate(date)}
          </p>
        </DialogHeader>

        <div className="py-6 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Skip tracking for today. No judgment.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}