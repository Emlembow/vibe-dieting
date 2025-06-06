'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-20 w-20 text-destructive" />
              </div>
              <CardTitle className="text-3xl font-bold">Application Error</CardTitle>
              <CardDescription>
                Something unexpected happened and we couldn't load the application.
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
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Please try refreshing the page. If the problem persists, contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}