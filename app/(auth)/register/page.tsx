"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { registerUser } from "@/app/actions/auth"
import { IceCream, CheckCircle, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [state, setState] = useState<{
    success: boolean
    error?: string
    message?: string
  }>({
    success: false,
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Form submitted")
    setIsLoading(true)
    setState({ success: false }) // Reset state
    
    const formData = new FormData(e.currentTarget)
    
    try {
      console.log("Calling registerUser...")
      const result = await registerUser(formData)
      console.log("Registration result:", result)
      setState(result)
    } catch (error) {
      console.error("Registration error:", error)
      setState({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 mr-3">
                <IceCream className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Vibe Dieting</h1>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Join Vibe Dieting</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            {state.success && state.message && (
              <Alert className="border-green-200 bg-green-50 text-green-900">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <strong>Success!</strong> {state.message}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                placeholder="johndoe" 
                required 
                disabled={isLoading || state.success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                disabled={isLoading || state.success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                minLength={6} 
                disabled={isLoading || state.success}
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {!state.success ? (
              <>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-pink-500 hover:text-pink-600 underline">
                    Sign in
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Next steps:</p>
                  <ol className="text-left space-y-2">
                    <li>1. Check your email inbox for a verification link</li>
                    <li>2. Click the link to verify your email address</li>
                    <li>3. You'll be automatically logged in</li>
                  </ol>
                </div>
                <div className="text-sm">
                  Didn't receive the email?{" "}
                  <Link href="/login" className="text-pink-500 hover:text-pink-600 underline">
                    Try logging in
                  </Link>
                </div>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
