import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";

export const maxDuration = 30;

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
  // 1. Unpack the request
  const { messages } = await req.json();

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

  // 6. Generate AI response
  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages: messagesWithContext as any,
  });

  return result.toTextStreamResponse();
}
