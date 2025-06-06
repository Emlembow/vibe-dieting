"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import type { FoodEntry } from "@/types/database"

interface EditFoodDialogProps {
  isOpen: boolean
  onClose: () => void
  foodEntry: FoodEntry | null
  onFoodUpdated: (updatedFood: FoodEntry) => void
}

export function EditFoodDialog({ isOpen, onClose, foodEntry, onFoodUpdated }: EditFoodDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<FoodEntry>>({
    name: foodEntry?.name || "",
    description: foodEntry?.description || "",
    calories: foodEntry?.calories || 0,
    protein_grams: foodEntry?.protein_grams || 0,
    carbs_total_grams: foodEntry?.carbs_total_grams || 0,
    carbs_fiber_grams: foodEntry?.carbs_fiber_grams || 0,
    carbs_sugar_grams: foodEntry?.carbs_sugar_grams || 0,
    fat_total_grams: foodEntry?.fat_total_grams || 0,
    fat_saturated_grams: foodEntry?.fat_saturated_grams || 0,
  })

  // Update form data when food entry changes
  useEffect(() => {
    if (foodEntry) {
      setFormData({
        name: foodEntry.name,
        description: foodEntry.description,
        calories: foodEntry.calories,
        protein_grams: foodEntry.protein_grams,
        carbs_total_grams: foodEntry.carbs_total_grams,
        carbs_fiber_grams: foodEntry.carbs_fiber_grams,
        carbs_sugar_grams: foodEntry.carbs_sugar_grams,
        fat_total_grams: foodEntry.fat_total_grams,
        fat_saturated_grams: foodEntry.fat_saturated_grams,
      })
    }
  }, [foodEntry])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const numericFields = [
      "calories",
      "protein_grams",
      "carbs_total_grams",
      "carbs_fiber_grams",
      "carbs_sugar_grams",
      "fat_total_grams",
      "fat_saturated_grams",
    ]

    setFormData({
      ...formData,
      [name]: numericFields.includes(name) ? Number(value) : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!foodEntry) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from("food_entries").update(formData).eq("id", foodEntry.id)

      if (error) throw error

      toast({
        title: "Food updated",
        description: "The food entry has been updated successfully",
      })

      // Return the updated food entry to the parent component
      onFoodUpdated({
        ...foodEntry,
        ...formData,
      } as FoodEntry)

      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update food entry",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Food Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Food Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                value={formData.calories}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="protein_grams">Protein (g)</Label>
                <Input
                  id="protein_grams"
                  name="protein_grams"
                  type="number"
                  step="0.1"
                  value={formData.protein_grams}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="carbs_total_grams">Carbs (g)</Label>
                <Input
                  id="carbs_total_grams"
                  name="carbs_total_grams"
                  type="number"
                  step="0.1"
                  value={formData.carbs_total_grams}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fat_total_grams">Fat (g)</Label>
                <Input
                  id="fat_total_grams"
                  name="fat_total_grams"
                  type="number"
                  step="0.1"
                  value={formData.fat_total_grams}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="carbs_fiber_grams">Fiber (g)</Label>
                <Input
                  id="carbs_fiber_grams"
                  name="carbs_fiber_grams"
                  type="number"
                  step="0.1"
                  value={formData.carbs_fiber_grams || 0}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="carbs_sugar_grams">Sugar (g)</Label>
                <Input
                  id="carbs_sugar_grams"
                  name="carbs_sugar_grams"
                  type="number"
                  step="0.1"
                  value={formData.carbs_sugar_grams || 0}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fat_saturated_grams">Saturated Fat (g)</Label>
              <Input
                id="fat_saturated_grams"
                name="fat_saturated_grams"
                type="number"
                step="0.1"
                value={formData.fat_saturated_grams || 0}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditFoodDialogProps {
  isOpen: boolean
  onClose: () => void
  foodEntry: FoodEntry | null
  onFoodUpdated: (updatedFood: FoodEntry) => void
}
