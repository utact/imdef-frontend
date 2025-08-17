export interface VerificationResponse {
  isValid: boolean
  message: string
}

export async function verifyKeyword(input: string): Promise<VerificationResponse> {
  try {
    // Simulate API call to backend for keyword verification
    const response = await fetch("/api/verify-keyword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: input.trim() }),
    })

    if (!response.ok) {
      throw new Error("Verification failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Keyword verification error:", error)
    // Fallback for development - remove in production
    return {
      isValid: input.trim().toLowerCase().includes("승준"),
      message: "Verification completed",
    }
  }
}
