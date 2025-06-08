"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, X, Zap } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library"

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onBarcodeScanned: (barcode: string) => void
}

export function BarcodeScanner({ isOpen, onClose, onBarcodeScanned }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [error, setError] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const { toast } = useToast()

  // Initialize scanner and get devices
  useEffect(() => {
    if (isOpen) {
      initializeScanner()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen])

  const initializeScanner = async () => {
    try {
      setError("")
      
      // Check if we have camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop()) // Stop the test stream

      // Initialize the barcode reader
      readerRef.current = new BrowserMultiFormatReader()
      
      // Get available video devices
      const videoDevices = await readerRef.current.listVideoInputDevices()
      setDevices(videoDevices)
      
      if (videoDevices.length > 0) {
        // Prefer back camera if available
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        )
        setSelectedDevice(backCamera?.deviceId || videoDevices[0].deviceId)
      } else {
        setError("No cameras found on this device")
      }
    } catch (err) {
      console.error("Camera initialization error:", err)
      setError("Camera access denied. Please allow camera permissions and try again.")
    }
  }

  const startScanning = async () => {
    if (!readerRef.current || !selectedDevice || !videoRef.current) {
      setError("Scanner not properly initialized")
      return
    }

    try {
      setIsScanning(true)
      setError("")

      await readerRef.current.decodeFromVideoDevice(
        selectedDevice,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcode = result.getText()
            console.log("Barcode scanned:", barcode)
            
            // Validate barcode (basic check for numeric and reasonable length)
            if (/^\d{8,14}$/.test(barcode)) {
              onBarcodeScanned(barcode)
              onClose()
              toast({
                title: "Barcode Scanned!",
                description: `Found barcode: ${barcode}`,
              })
            } else {
              toast({
                title: "Invalid Barcode",
                description: "Please scan a valid product barcode (8-14 digits)",
                variant: "destructive",
              })
            }
          }
          
          if (error && !(error instanceof NotFoundException)) {
            console.warn("Scan error:", error)
          }
        }
      )
    } catch (err) {
      console.error("Scanning error:", err)
      setError("Failed to start scanning. Please try again.")
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
    setIsScanning(false)
  }

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId)
    if (isScanning) {
      stopScanning()
      // Restart with new device after a short delay
      setTimeout(() => {
        startScanning()
      }, 100)
    }
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
          <DialogDescription>
            Point your camera at a product barcode to automatically look up nutrition information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          {devices.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Camera:</label>
              <select
                value={selectedDevice}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
                disabled={isScanning}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-black rounded-md object-cover"
              style={{ display: isScanning ? 'block' : 'none' }}
            />
            
            {!isScanning && !error && (
              <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Camera className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500">Ready to scan</p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanning overlay */}
                <div className="absolute inset-4 border-2 border-red-500 rounded-md">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Position barcode in the frame
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isScanning ? (
              <Button 
                onClick={startScanning} 
                disabled={!selectedDevice || !!error}
                className="flex-1"
              >
                <Zap className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            ) : (
              <Button 
                onClick={stopScanning} 
                variant="outline"
                className="flex-1"
              >
                Stop Scanning
              </Button>
            )}
            
            <Button variant="outline" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Make sure your camera has good lighting and the barcode is clearly visible.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}