import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { init } from "observa-sdk";

export const maxDuration = 30;

// Observa API URL
const observaApiUrl = process.env.OBSERVA_API_URL || (process.env.NODE_ENV === "production" ? "https://observa-api.vercel.app" : "http://localhost:3000");
console.log(`[Customer Chat] Observa API URL: ${observaApiUrl}`);

// Note: Observa SDK will be initialized per-request with API key from request

// --- 1. THE FAKE DATABASE (Simulating RAG) ---
async function getFakeContext(query: string) {
  // Simulate database delay (100ms)
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Simple keyword matching to simulate vector search
  if (query.toLowerCase().includes("refund")) {
    return `[CONTEXT] Refund Policy: Refunds are allowed within 30 days only. No refunds for digital items.`;
  }
  if (query.toLowerCase().includes("price")) {
    return `[CONTEXT] Pricing: Pro plan is $29/mo, Enterprise is $99/mo.`;
  }

  return `[CONTEXT] General Info: We are FlightOps, the flight management company.`;
}

export async function POST(req: Request) {
  // 1. Unpack the box
  const { 
    messages, 
    apiKey, 
    conversationId, 
    sessionId, 
    userId, 
    messageIndex 
  } = await req.json();

  // Validate API key
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key is required. Please configure it in settings." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Initialize Observa SDK with API key from request
  const observa = init({
    apiKey: apiKey,
    apiUrl: observaApiUrl,
    environment: (process.env.NODE_ENV === "production" ? "prod" : "dev") as "dev" | "prod",
    mode: (process.env.NODE_ENV === "production" ? "production" : "development") as "production" | "development",
  });

  // 2. Get the user's last message to search our "database"
  const lastUserMessage = messages[messages.length - 1];
  // Extract text from UIMessage parts array
  const userQuery =
    lastUserMessage.parts
      ?.filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("") || "";

  // --- 3. RETRIEVE CONTEXT (This is what we need to observe!) ---
  const context = await getFakeContext(userQuery);
  console.log("🔍 [APP] Retrieved Context:", context);

  // 4. Convert UI messages to model messages (await the promise)
  const modelMessages = await convertToModelMessages(
    messages as Array<Omit<UIMessage, "id">>
  );

  // --- 5. INJECT CONTEXT INTO SYSTEM PROMPT ---
  // We prepend a "System" message with the context
  const messagesWithContext = [
    {
      role: "system",
      content: `Answer using this context only:\n${context}`,
    },
    ...modelMessages,
  ];

  // 6. Cook the meal (Ask OpenAI) now its wrapped inside our tracking SDK
  console.log("📊 [OBSERVA] Tracking query with Observa SDK...");
  console.log(`📊 [OBSERVA] Conversation: ${conversationId}, Message: ${messageIndex}`);
  
  try {
    const response = await observa.track(
      {
        query: userQuery,
        context: context,
        model: "gpt-4o-mini",
        // Conversation tracking fields
        conversationId: conversationId || undefined,
        sessionId: sessionId || undefined,
        userId: userId || undefined,
        messageIndex: messageIndex !== undefined ? messageIndex + 1 : undefined, // +1 because we're about to send
        metadata: {
          // Add any additional metadata you want to track
          messageCount: messages.length,
        },
      },
      async () => {
        // The action should return a Response object
        const result = await streamText({
          model: openai("gpt-4o-mini"),
          messages: messagesWithContext as any,
        });
        return result.toTextStreamResponse();
      }
    );
    console.log(
      "✅ [OBSERVA] Tracking complete - data sent to Observa with conversation tracking"
    );
    return response;
  } catch (error) {
    console.error("❌ [OBSERVA] Error during tracking:", error);
    // Still return the response even if tracking fails
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: messagesWithContext as any,
    });
    return result.toTextStreamResponse();
  }
}
