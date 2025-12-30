"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import type { UIMessage } from "ai";
import SettingsModal from "./components/SettingsModal";

export default function Page(): React.JSX.Element {
  const [input, setInput] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
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
    } else {
      // Show settings if no API key
      setIsSettingsOpen(true);
    }

    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
    if (savedUserId) {
      setUserId(savedUserId);
    }
    if (savedMessageIndex) {
      setMessageIndex(parseInt(savedMessageIndex, 10));
    }
  }, []);

  // Create custom transport that includes conversation tracking data
  // Memoize to recreate when conversation data changes
  const customTransport = useMemo(() => {
    return new TextStreamChatTransport({
      api: "/api/chat",
      fetch: async (url, options) => {
        // Add conversation tracking data to request body
        if (options?.body) {
          try {
            const body = JSON.parse(options.body as string);
            body.apiKey = apiKey;
            body.conversationId = conversationId;
            body.sessionId = sessionId;
            body.userId = userId;
            body.messageIndex = messageIndex;
            options.body = JSON.stringify(body);
          } catch (e) {
            console.error("Error modifying request body:", e);
          }
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
      // Increment message index after each message
      const newIndex = messageIndex + 1;
      setMessageIndex(newIndex);
      localStorage.setItem("observa_message_index", newIndex.toString());
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status !== "streaming") {
      if (!apiKey) {
        setIsSettingsOpen(true);
        alert("Please configure your Observa API key in settings first.");
        return;
      }
      
      // Send message (conversation tracking data is added by custom transport)
      sendMessage({ text: input });
      setInput("");
    }
  };

  const isLoading = status === "submitted" || status === "streaming";

  const handleApiKeySave = (newApiKey: string) => {
    setApiKey(newApiKey);
    // Reload conversation/session IDs
    setConversationId(localStorage.getItem("observa_conversation_id"));
    setSessionId(localStorage.getItem("observa_session_id"));
    setUserId(localStorage.getItem("observa_user_id"));
  };

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
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleApiKeySave}
      />
    </main>
  );
}
