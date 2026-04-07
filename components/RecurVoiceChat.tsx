"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const openingMessage =
  "Hi. I am the RecurVoice AI. I can explain how voice changes can relate to lung cancer follow-up, what HNR, jitter, and shimmer mean in plain language, how to do the most accurate Ahhhh, and how RecurVoice compares your trend over time.";

export function RecurVoiceChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: openingMessage }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, isLoading]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || isLoading) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const payload = (await response.json()) as { content?: string };
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            payload.content ??
            "I could not reach the assistant right now. Please try again in a moment."
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I could not reach the assistant right now. Please try again in a moment."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_28px_80px_rgba(12,22,16,0.10)]">
      <div className="flex items-center gap-3 bg-[#1B4332] px-5 py-4 text-white">
        <div className="rounded-2xl bg-white/10 p-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16a4 4 0 0 0 4-4V9a4 4 0 1 0-8 0v3a4 4 0 0 0 4 4Zm0 0v3m-4 0h8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold">RecurVoice AI</p>
          <p className="text-sm text-white/70">Ask me anything</p>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="soft-scrollbar h-[480px] space-y-3 overflow-y-auto bg-[#FAFBF8] px-4 py-4"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-[22px] px-4 py-3 text-[15px] leading-7 ${
                message.role === "user"
                  ? "bg-[#1B4332] text-white"
                  : "bg-white text-[#203226] shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-[22px] bg-white px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#1B4332] [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#1B4332] [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#1B4332]" />
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-black/5 bg-white p-4">
        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-[#FAFBF8] px-4 py-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask about your voice trend, lung cancer follow-up, or this week's scores..."
            className="min-w-0 flex-1 bg-transparent text-base text-[#0A0A0A] outline-none placeholder:text-[#6B7280]"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            className="rounded-full bg-[#1B4332] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#143628]"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
