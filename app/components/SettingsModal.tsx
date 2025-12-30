"use client";

import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load saved API key from localStorage
      const saved = localStorage.getItem("observa_api_key");
      if (saved) {
        setApiKey(saved);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert("Please enter an API key");
      return;
    }

    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem("observa_api_key", apiKey);
      
      // Also save conversation/session IDs if they don't exist
      if (!localStorage.getItem("observa_conversation_id")) {
        localStorage.setItem(
          "observa_conversation_id",
          `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        );
      }
      if (!localStorage.getItem("observa_session_id")) {
        localStorage.setItem(
          "observa_session_id",
          `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        );
      }
      if (!localStorage.getItem("observa_user_id")) {
        localStorage.setItem(
          "observa_user_id",
          `user-${Math.random().toString(36).substr(2, 9)}`
        );
      }

      onSave(apiKey);
      onClose();
    } catch (error) {
      console.error("Error saving API key:", error);
      alert("Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Observa Settings</h2>
        
        <div className="mb-4">
          <label className="block text-sm text-neutral-400 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Observa API key"
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p className="text-xs text-neutral-500 mt-2">
            Get your API key from{" "}
            <a
              href="https://observa-app.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline"
            >
              observa-app.vercel.app
            </a>
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-neutral-700 text-sm hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !apiKey.trim()}
            className="px-4 py-2 rounded-md bg-emerald-500 text-black text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

