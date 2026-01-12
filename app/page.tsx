"use client";

import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

export default function Page(): React.JSX.Element {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status !== "streaming") {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <main className="min-h-screen flex flex-col items-center bg-black text-white p-6">
      <div className="w-full max-w-2xl flex flex-col border border-neutral-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Airlines Customer Chat</h1>
          {status && (
            <div className="text-xs text-neutral-500">
              Status: <span className="text-emerald-400">{status}</span>
            </div>
          )}
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
      </div>
    </main>
  );
}
