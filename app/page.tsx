"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import type { UIMessage } from "ai";
// Simple ID generator (no external dependency needed)
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function Page(): React.JSX.Element {
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  // Load settings on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("observa_api_key");
    const savedConversationId = localStorage.getItem("observa_conversation_id");
    const savedSessionId = localStorage.getItem("observa_session_id");
    const savedUserId = localStorage.getItem("observa_user_id");
    const savedMessageIndex = localStorage.getItem("observa_message_index");

    if (savedApiKey) {
      setApiKey(savedApiKey);
      setApiKeyInput(savedApiKey);
    } else {
      // Show settings if no API key is found
      setShowSettings(true);
    }

    if (savedConversationId) {
      setConversationId(savedConversationId);
    } else {
      const newConvId = generateId();
      localStorage.setItem("observa_conversation_id", newConvId);
      setConversationId(newConvId);
    }

    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newSessionId = generateId();
      localStorage.setItem("observa_session_id", newSessionId);
      setSessionId(newSessionId);
    }

    if (savedUserId) {
      setUserId(savedUserId);
    } else {
      const newUserId = generateId();
      localStorage.setItem("observa_user_id", newUserId);
      setUserId(newUserId);
    }

    if (savedMessageIndex) {
      setMessageIndex(parseInt(savedMessageIndex, 10));
    }
  }, []);

  // Atomic message index counter using ref to prevent race conditions
  // This ensures each message gets a unique index even when sent rapidly
  const messageIndexRef = React.useRef<number>(0);
  
  // Initialize ref from localStorage on mount (client-side only)
  useEffect(() => {
    const savedIndex = parseInt(localStorage.getItem("observa_message_index") || "0", 10);
    messageIndexRef.current = savedIndex;
  }, []);

  // Create custom transport that includes conversation tracking data
  // Memoize to recreate when conversation data changes
  const customTransport = useMemo(() => {
    return new TextStreamChatTransport({
      api: "/api/chat",
      fetch: async (url, options) => {
        // Always add API key and conversation tracking data to request body
        if (!options) {
          options = {};
        }
        
        try {
          // Read API key directly from localStorage to ensure we have the latest value
          const currentApiKey = localStorage.getItem("observa_api_key") || apiKey || "";
          const currentConversationId = localStorage.getItem("observa_conversation_id") || conversationId || null;
          const currentSessionId = localStorage.getItem("observa_session_id") || sessionId || null;
          const currentUserId = localStorage.getItem("observa_user_id") || userId || null;
          
          // Use atomic counter to get and increment messageIndex
          // This prevents race conditions when multiple messages are sent rapidly
          const currentMessageIndex = messageIndexRef.current;
          messageIndexRef.current = currentMessageIndex + 1;
          localStorage.setItem("observa_message_index", messageIndexRef.current.toString());
          
          let body: any = {};
          if (options.body) {
            try {
              body = JSON.parse(options.body as string);
            } catch (e) {
              // If body is not JSON, create new object
              console.warn("Request body is not JSON, creating new body");
            }
          }
          
          // Always include API key and conversation tracking (read from localStorage for reliability)
          // Ensure API key is not empty - if it is, log error but still send (backend will reject with clear error)
          const trimmedApiKey = currentApiKey ? currentApiKey.trim() : "";
          
          body.apiKey = trimmedApiKey;
          body.conversationId = currentConversationId;
          body.sessionId = currentSessionId;
          body.userId = currentUserId;
          // Send current index, backend will add +1
          body.messageIndex = currentMessageIndex;
          
          console.log(`[Customer Chat] Sending message with index ${currentMessageIndex} (next will be ${messageIndexRef.current})`);
          
          // Debug logging
          console.log("[Customer Chat] Sending request:");
          console.log("  - API Key present:", !!trimmedApiKey);
          console.log("  - API Key length:", trimmedApiKey.length);
          console.log("  - API Key preview:", trimmedApiKey ? `${trimmedApiKey.substring(0, 30)}...` : "MISSING");
          console.log("  - Conversation ID:", currentConversationId);
          console.log("  - Message Index:", currentMessageIndex);
          
          if (!trimmedApiKey) {
            console.error("[Customer Chat] ERROR: API key is missing or empty!");
            console.error("  - localStorage value:", localStorage.getItem("observa_api_key"));
            console.error("  - State value:", apiKey);
          }
          
          options.body = JSON.stringify(body);
        } catch (e) {
          console.error("Error modifying request body:", e);
        }
        return fetch(url, options);
      },
    });
  }, [apiKey, conversationId, sessionId, userId, messageIndex]);

  const { messages, sendMessage, status, error } = useChat({
    transport: customTransport,
    onError: (error) => {
      console.error("Chat error:", error);
    },
    onFinish: () => {
      // Message index was already incremented before sending (in fetch function)
      // Sync state with the ref to keep UI in sync
      setMessageIndex(messageIndexRef.current);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status !== "streaming") {
      if (!apiKey || !apiKey.trim()) {
        setShowSettings(true);
        alert("Please configure your Observa API key first.");
        return;
      }
      
      // Send message (conversation tracking data is added by custom transport)
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleApiKeySave = () => {
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) {
      alert("Please enter an API key");
      return;
    }
    
    // Save to localStorage first
    localStorage.setItem("observa_api_key", trimmedKey);
    
    // Update state
    setApiKey(trimmedKey);
    
    // Verify it was saved
    const saved = localStorage.getItem("observa_api_key");
    if (saved !== trimmedKey) {
      console.error("[Customer Chat] WARNING: API key may not have saved correctly!");
      console.error("  - Expected:", trimmedKey.substring(0, 20) + "...");
      console.error("  - Got:", saved ? saved.substring(0, 20) + "..." : "null");
    } else {
      console.log("[Customer Chat] API key saved successfully:", trimmedKey.substring(0, 20) + "...");
    }
    
    setShowSettings(false);
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <main className="min-h-screen flex flex-col items-center bg-black text-white p-6">
      <div className="w-full max-w-2xl flex flex-col border border-neutral-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">
            Airlines Customer Chat (Box A)
          </h1>
          <div className="flex items-center gap-3">
            {apiKey && (
              <div className="text-xs text-neutral-500">
                <span className="text-emerald-400">●</span> Observa Connected
              </div>
            )}
            {status && (
              <div className="text-xs text-neutral-500">
                Status: <span className="text-emerald-400">{status}</span>
              </div>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800"
            >
              ⚙️ {showSettings ? "Hide" : "Settings"}
            </button>
          </div>
        </div>

        {/* Inline Settings Section */}
        {showSettings && (
          <div className="mb-4 p-4 border border-neutral-700 rounded-lg bg-neutral-950">
            <h3 className="text-sm font-semibold mb-3">Observa API Key</h3>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your Observa API key (JWT)"
                className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleApiKeySave}
                className="px-4 py-2 rounded-md bg-emerald-500 text-black text-sm hover:bg-emerald-600"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Get your API key from{" "}
              <a
                href="https://observa-app.vercel.app/dashboard/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                observa-app.vercel.app/dashboard/settings
              </a>
            </p>
            {apiKey && (
              <p className="text-xs text-emerald-400 mt-2">
                ✓ API key configured ({apiKey.substring(0, 20)}...)
              </p>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto border border-neutral-800 rounded-md p-3 mb-4 space-y-2">
          {error && (
            <div className="p-3 rounded-md bg-red-900/20 border border-red-800 text-red-400 text-sm">
              <div className="font-semibold mb-1">Error</div>
              <div>
                {error.message ||
                  "An error occurred. Please check your OpenAI API key and billing status."}
              </div>
              {error.message?.includes("quota") && (
                <div className="mt-2 text-xs">
                  Check your OpenAI billing at{" "}
                  <a
                    href="https://platform.openai.com/account/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    platform.openai.com/account/billing
                  </a>
                </div>
              )}
            </div>
          )}
          {messages.map((m: UIMessage) => {
            const role = m.role;
            const content = m.parts
              .filter((part) => part.type === "text")
              .map((part) => (part as { text: string }).text)
              .join("");

            return (
              <div
                key={m.id}
                className={`p-2 rounded ${
                  role === "user" ? "bg-neutral-800" : "bg-neutral-900"
                }`}
              >
                <div className="text-xs text-neutral-400 mb-1">
                  {role === "user" ? "User" : "AI"}
                </div>
                <div>{content}</div>
              </div>
            );
          })}
          {messages.length === 0 && !error && (
            <div className="text-neutral-500 text-sm">
              Start typing below to talk to the model.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-md bg-emerald-500 text-black text-sm disabled:opacity-50"
          >
            {isLoading ? "Thinking..." : "Send"}
          </button>
        </form>

        {apiKey && conversationId && (
          <div className="mt-4 text-xs text-neutral-500 border-t border-neutral-800 pt-3">
            <div>Conversation: {conversationId.substring(0, 20)}...</div>
            <div>Messages: {messageIndex}</div>
            <div className="mt-2">
              <a
                href={`https://observa-app.vercel.app/dashboard/conversations/${conversationId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                View in Observa Dashboard →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
