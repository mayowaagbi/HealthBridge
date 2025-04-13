import { useState, useRef, useCallback } from "react";
import { Groq } from "groq-sdk";
import { Message } from "../components/HealthChatbot/types";

interface UseChatStreamReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  abortRequest: () => void;
  clearMessages: () => void;
}

const useChatStream = (apiKey: string): UseChatStreamReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const groq = new Groq({
    apiKey: apiKey || process.env.REACT_APP_GROQ_API_KEY || "",
  });

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setError("Request cancelled");
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      try {
        // Add empty assistant message for streaming
        setMessages((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            role: "assistant",
            content: "",
            timestamp: Date.now(),
          },
        ]);

        const stream = await groq.chat.completions.create(
          {
            messages: [
              {
                role: "system",
                content:
                  "You are a health-focused assistant. Provide accurate, " +
                  "concise health information. Never diagnose - always " +
                  "recommend consulting a professional for medical concerns.",
              },
              ...messages.map(({ role, content }) => ({ role, content })),
              { role: "user", content: content.trim() },
            ],
            model: "llama3-70b-8192",
            temperature: 0.7,
            max_tokens: 1024,
            stream: true,
          },
          { signal: abortControllerRef.current.signal }
        );

        let fullResponse = "";
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === "assistant") {
                lastMessage.content = fullResponse;
                lastMessage.id = chunk.id || lastMessage.id; // Update with real ID if available
              }
              return newMessages;
            });
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Chat stream error:", err);
          setError("Failed to get response. Please try again.");
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "Sorry, I encountered an error processing your request.",
              timestamp: Date.now(),
            },
          ]);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading, groq]
  );

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    abortRequest,
    clearMessages,
  };
};

export default useChatStream;
