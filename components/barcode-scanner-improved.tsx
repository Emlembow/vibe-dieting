"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, X, Zap, Settings, FlashlightIcon as Flashlight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library"

interface BarcodeScannerImprovedProps {
  isOpen: boolean
  onClose: () => void
  onBarcodeScanned: (barcode: string) => void
}

export function BarcodeScannerImproved({ isOpen, onClose, onBarcodeScanned }: BarcodeScannerImprovedProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [torch, setTorch] = useState(false)
  const [zoom, setZoom] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment" // Prefer back camera
        } 
      })
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

      // Enhanced camera constraints for better barcode scanning
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDevice,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          facingMode: "environment",
        }
      }

      // Get the video stream with enhanced constraints
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Apply additional camera settings if supported
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities() as any
        
        // Apply torch if available
        if (torch && capabilities.torch) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ torch: true } as any]
            })
          } catch (e) {
            console.log("Torch not supported")
          }
        }

        // Apply zoom if available
        if (zoom > 1 && capabilities.zoom) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ zoom: zoom } as any]
            })
          } catch (e) {
            console.log("Zoom not supported")
          }
        }

        // Apply manual focus for close-up scanning if available
        if (capabilities.focusMode) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ 
                focusMode: "manual",
                focusDistance: 0.1 // Close focus for barcodes
              } as any]
            })
          } catch (e) {
            // Fall back to continuous focus
            console.log("Manual focus not supported, using continuous")
          }
        }
      }

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      // Start barcode detection
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const toggleTorch = async () => {
    if (!streamRef.current) return

    const videoTrack = streamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities() as any
      if (capabilities.torch) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ torch: !torch } as any]
          })
          setTorch(!torch)
        } catch (e) {
          console.warn("Torch not supported on this device")
        }
      }
    }
  }

  const adjustZoom = async (newZoom: number) => {
    if (!streamRef.current) return

    const videoTrack = streamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities() as any
      if (capabilities.zoom) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ zoom: newZoom } as any]
          })
          setZoom(newZoom)
        } catch (e) {
          console.warn("Zoom not supported on this device")
        }
      }
    }
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
            Enhanced Barcode Scanner
          </DialogTitle>
          <DialogDescription>
            Advanced scanner with auto-focus and zoom controls for better barcode detection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          {/* Camera controls */}
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

          {/* Video feed */}
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
                  <p className="text-sm text-gray-500">Enhanced Scanner Ready</p>
                  <p className="text-xs text-gray-400">Auto-focus & zoom controls</p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanning overlay */}
                <div className="absolute inset-4 border-2 border-green-500 rounded-md">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Move closer for better focus
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced controls */}
          {isScanning && (
            <div className="space-y-3">
              {/* Zoom control */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Zoom: {zoom.toFixed(1)}x</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => adjustZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Torch control */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleTorch}
                className="w-full"
              >
                <Flashlight className={`mr-2 h-4 w-4 ${torch ? 'text-yellow-500' : ''}`} />
                {torch ? 'Turn Off Flash' : 'Turn On Flash'}
              </Button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {!isScanning ? (
              <Button 
                onClick={startScanning} 
                disabled={!selectedDevice || !!error}
                className="flex-1"
              >
                <Zap className="mr-2 h-4 w-4" />
                Start Enhanced Scan
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

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p><strong>Enhanced Features:</strong></p>
            <p>• Continuous auto-focus for close-up scanning</p>
            <p>• Zoom control for small barcodes</p>
            <p>• Flashlight for low-light conditions</p>
            <p>• Higher resolution capture</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}