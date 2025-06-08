"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Upload, X, Loader2, RotateCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library"

interface BarcodePhotoScannerProps {
  isOpen: boolean
  onClose: () => void
  onBarcodeScanned: (barcode: string) => void
}

export function BarcodePhotoScanner({ isOpen, onClose, onBarcodeScanned }: BarcodePhotoScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file")
      return
    }

    setSelectedImage(file)
    setError("")

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const processImageForBarcode = async () => {
    if (!selectedImage) {
      setError("Please select an image first")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // Create an image element for processing
      const img = new Image()

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imagePreview!
      })

      // Initialize barcode reader
      const reader = new BrowserMultiFormatReader()
      
      // Try to decode barcode from image element
      const result = await reader.decodeFromImageElement(img)
      
      if (result) {
        const barcode = result.getText()
        console.log("Barcode detected from image:", barcode)
        
        // Validate barcode (basic check for numeric and reasonable length)
        if (/^\d{8,14}$/.test(barcode)) {
          onBarcodeScanned(barcode)
          handleClose()
          toast({
            title: "Barcode Found!",
            description: `Successfully detected barcode: ${barcode}`,
          })
        } else {
          setError("Invalid barcode detected. Please try a clearer image.")
        }
      } else {
        setError("No barcode found in image. Make sure the barcode is clearly visible and try again.")
      }
    } catch (err) {
      console.error("Barcode processing error:", err)
      if (err instanceof NotFoundException) {
        setError("No barcode found in image. Make sure the barcode is clearly visible and well-lit.")
      } else {
        setError("Failed to process image. Please try a different photo.")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setError("")
    setIsProcessing(false)
    onClose()
  }

  const resetImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setError("")
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode from Photo
          </DialogTitle>
          <DialogDescription>
            Take a photo of the product barcode using your device's camera, then we'll extract the barcode information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          {/* Image preview area */}
          <div className="relative">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected barcode image"
                  className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800 rounded-md"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={resetImage}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                onClick={triggerFileInput}
              >
                <div className="text-center space-y-2">
                  <Camera className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500">Tap to take a photo</p>
                  <p className="text-xs text-gray-400">Or select from gallery</p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment" // Prefer back camera for barcode scanning
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            {!selectedImage ? (
              <>
                <Button onClick={triggerFileInput} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture')
                      fileInputRef.current.click()
                    }
                  }}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={processImageForBarcode}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Scan Barcode"
                  )}
                </Button>
                <Button variant="outline" onClick={resetImage}>
                  Retake
                </Button>
              </>
            )}
          </div>

          <Button variant="outline" onClick={handleClose} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>💡 <strong>Tips for best results:</strong></p>
            <p>• Make sure the barcode is clearly visible and well-lit</p>
            <p>• Hold the camera steady and get the entire barcode in frame</p>
            <p>• Avoid shadows and reflections on the barcode</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}