"use server"

export async function registerUser(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const username = formData.get("username") as string

    if (!email || !password || !username) {
      return {
        success: false,
        error: "Email, password, and username are required",
      }
    }

    // Call the secure API route instead of using admin SDK
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Registration failed",
      }
    }

    return {
      success: true,
      message: result.message || "Account created successfully!",
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}
