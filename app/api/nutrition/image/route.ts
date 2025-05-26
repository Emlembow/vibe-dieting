import type { NutritionResponse } from "@/types/database"
import { NextResponse } from "next/server"

// Assistant ID from your workspace
const ASSISTANT_ID = "asst_WHhkCaZpesjEEX8CDNQUz0fX"

// Get API key from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-your-api-key-here"

export async function POST(request: Request) {
  try {
    // Parse the multipart form data to get the image
    const formData = await request.formData()
    const foodImage = formData.get("foodImage") as File | null

    if (!foodImage) {
      return NextResponse.json({ error: "Food image is required" }, { status: 400 })
    }

    console.log("Request received with food image:", foodImage.name, "Size:", foodImage.size)

    // Common headers for all requests
    const headers = {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "assistants=v2", // Add the required beta header
    }

    // 1. Create a thread
    console.log("Creating thread...")
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({}),
    })

    if (!threadResponse.ok) {
      const errorData = await threadResponse.json()
      console.error("Error creating thread:", errorData)
      throw new Error(`Failed to create thread: ${errorData.error?.message || "Unknown error"}`)
    }

    const threadData = await threadResponse.json()
    const threadId = threadData.id
    console.log("Thread created:", threadId)

    // 2. First, upload the file to OpenAI with purpose: "vision"
    console.log("Uploading file to OpenAI...")
    const imageArrayBuffer = await foodImage.arrayBuffer()
    const imageBuffer = Buffer.from(imageArrayBuffer)

    // Create a Blob from the file
    const blob = new Blob([imageBuffer], { type: foodImage.type })

    // Create a FormData object for the file upload
    const fileFormData = new FormData()
    fileFormData.append("file", blob, foodImage.name)
    fileFormData.append("purpose", "vision") // Important: Set purpose to "vision"

    const fileUploadResponse = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: fileFormData,
    })

    if (!fileUploadResponse.ok) {
      const errorData = await fileUploadResponse.json()
      console.error("Error uploading file:", errorData)
      throw new Error(`Failed to upload file: ${errorData.error?.message || "Unknown error"}`)
    }

    const fileData = await fileUploadResponse.json()
    const fileId = fileData.id
    console.log("File uploaded with ID:", fileId)

    // 3. Add a message with the image in the content array
    console.log("Adding message to thread...")
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        role: "user",
        content: [
          {
            type: "image_file",
            image_file: { file_id: fileId },
          },
          {
            type: "text",
            text: "Analyze this food image and provide nutrition information in JSON format.",
          },
        ],
      }),
    })

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json()
      console.error("Error adding message:", errorData)
      throw new Error(`Failed to add message: ${errorData.error?.message || "Unknown error"}`)
    }

    console.log("Message with image added to thread")

    // 4. Run the assistant
    console.log("Running assistant...")
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    })

    if (!runResponse.ok) {
      const errorData = await runResponse.json()
      console.error("Error running assistant:", errorData)
      throw new Error(`Failed to run assistant: ${errorData.error?.message || "Unknown error"}`)
    }

    const runData = await runResponse.json()
    const runId = runData.id
    console.log("Run created:", runId)

    // 5. Poll for the run to complete
    console.log("Polling for run completion...")
    let runStatus = "queued"
    let attempts = 0
    const maxAttempts = 60 // 60 seconds timeout (image processing may take longer)

    while (runStatus !== "completed" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: "GET",
        headers,
      })

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json()
        console.error("Error checking run status:", errorData)
        throw new Error(`Failed to check run status: ${errorData.error?.message || "Unknown error"}`)
      }

      const statusData = await statusResponse.json()
      runStatus = statusData.status
      console.log(`Run status (attempt ${attempts + 1}): ${runStatus}`)
      attempts++

      if (runStatus === "failed" || runStatus === "cancelled" || runStatus === "expired") {
        throw new Error(`Run failed with status: ${runStatus}`)
      }
    }

    if (runStatus !== "completed") {
      throw new Error(`Run timed out or failed with status: ${runStatus}`)
    }

    // 6. Get the messages from the thread
    console.log("Retrieving messages...")
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "GET",
      headers,
    })

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json()
      console.error("Error retrieving messages:", errorData)
      throw new Error(`Failed to retrieve messages: ${errorData.error?.message || "Unknown error"}`)
    }

    const messagesData = await messagesResponse.json()
    console.log(`Retrieved ${messagesData.data.length} messages`)

    // Find the assistant's response
    const assistantMessages = messagesData.data.filter((message) => message.role === "assistant")

    if (assistantMessages.length === 0) {
      console.error("No assistant messages found")
      throw new Error("No response from assistant")
    }

    // Parse the JSON response
    const responseContent = assistantMessages[0].content[0]

    if (responseContent.type !== "text") {
      console.error(`Unexpected response type: ${responseContent.type}`)
      throw new Error("Unexpected response format")
    }

    console.log("Assistant response:", responseContent.text.value)

    // Parse the JSON from the text response
    try {
      // Extract JSON from the response text (the assistant might include explanatory text)
      const jsonMatch =
        responseContent.text.value.match(/```json\s*([\s\S]*?)\s*```/) || responseContent.text.value.match(/{[\s\S]*}/)

      let jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseContent.text.value

      // Clean up the JSON text if needed
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "")

      const nutritionData: NutritionResponse = JSON.parse(jsonText)

      // Clean up - delete the file from OpenAI
      try {
        await fetch(`https://api.openai.com/v1/files/${fileId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        })
        console.log("File deleted from OpenAI")
      } catch (deleteError) {
        console.error("Error deleting file:", deleteError)
        // Don't throw here, as we still want to return the nutrition data
      }

      return NextResponse.json(nutritionData)
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError)
      throw new Error("Failed to parse nutrition data")
    }
  } catch (error: any) {
    console.error("Error in nutrition image API:", error)
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
