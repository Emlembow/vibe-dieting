'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Protected route error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Oops! Something went wrong</CardTitle>
            <CardDescription>
              We encountered an error while loading this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Error:</strong> {error.message || 'An unexpected error occurred.'}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Error ID:</strong> {error.digest}
                </p>
              )}
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </a>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                If this problem persists, please try refreshing the page or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}