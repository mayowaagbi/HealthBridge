import React, { useState, useRef, useEffect } from "react";
import { Groq } from "groq-sdk";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const scale = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const HealthChatbot: React.FC<{ apiKey?: string }> = ({
  apiKey: propApiKey,
}) => {
  // State and refs
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Health Campus assistant. How can I help with your health questions today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(propApiKey || "");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [messageBuffer, setMessageBuffer] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Groq client with browser allowance when key is available
  const groq = localApiKey
    ? new Groq({
        apiKey: localApiKey,
        dangerouslyAllowBrowser: true,
      })
    : null;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages]);

  // Process message buffer when not loading
  useEffect(() => {
    if (!isLoading && messageBuffer.length > 0) {
      const processNextMessage = async () => {
        const nextMessage = messageBuffer[0];
        await handleSendMessage(nextMessage.content);
        setMessageBuffer((prev) => prev.slice(1));
      };
      processNextMessage();
    }
  }, [isLoading, messageBuffer]);

  // Check for saved API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("groq_api_key");
    if (savedKey) {
      setLocalApiKey(savedKey);
    }
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !groq) return;

    setIsLoading(true);
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

      // Get chat completion stream
      const stream = await groq.chat.completions.create(
        {
          messages: [
            {
              role: "system",
              content:
                "You are a health-focused assistant for Health Campus. " +
                "Provide accurate, concise health information. Never diagnose - " +
                "always recommend consulting a professional for medical concerns.",
            },

            ...messages.map((m) => ({ role: m.role, content: m.content })),
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
        const chunkContent = chunk.choices[0]?.delta?.content || "";
        if (chunkContent) {
          fullResponse += chunkContent;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === "assistant") {
              lastMsg.content = fullResponse;
              // Update temporary ID with real ID if available
              if (chunk.id) lastMsg.id = chunk.id;
            }
            return newMessages;
          });

          // Auto-scroll only if user hasn't manually scrolled up
          if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
              chatContainerRef.current;
            const isNearBottom =
              scrollHeight - (scrollTop + clientHeight) < 100;
            if (isNearBottom) {
              messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: Date.now(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !localApiKey) return;

    // If already processing, add to buffer
    if (isLoading) {
      setMessageBuffer((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: input,
          timestamp: Date.now(),
        },
      ]);
    } else {
      // Add user message immediately
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: input,
          timestamp: Date.now(),
        },
      ]);
      handleSendMessage(input);
    }
    setInput("");
  };

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localApiKey.trim()) {
      localStorage.setItem("groq_api_key", localApiKey);
      setShowKeyInput(false);
    }
  };

  const abortRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="chat-window"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={scale}
            transition={{ duration: 0.2 }}
            className="w-80 md:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-[500px] max-h-[80vh]"
          >
            {/* Header */}
            <motion.div
              className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-blue-600 text-white rounded-t-lg"
              variants={fadeIn}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold"
                  whileHover={{ scale: 1.1 }}
                >
                  HC
                </motion.div>
                <h3 className="font-semibold">Health Assistant</h3>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
                whileHover={{ scale: 1.1 }}
              >
                ✕
              </motion.button>
            </motion.div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
            >
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={message.role === "user" ? slideUp : fadeIn}
                    transition={{ duration: 0.2 }}
                    className={`flex max-w-[90%] ${
                      message.role === "user"
                        ? "ml-auto justify-end"
                        : "justify-start"
                    }`}
                  >
                    <motion.div
                      className={`px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      style={{
                        maxWidth: "100%",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-wrap", // Preserve formatting and wrap text
                      }}
                    >
                      {message.content}
                    </motion.div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="flex justify-start"
                  >
                    <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none">
                      <div className="flex space-x-1">
                        <div
                          className="h-2 w-2 rounded-full bg-gray-500 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-gray-500 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-gray-500 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* API Key Input (if needed) */}
            {!localApiKey && showKeyInput && (
              <motion.form
                onSubmit={handleKeySubmit}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideUp}
                className="p-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="mb-2">
                  <label
                    htmlFor="apiKey"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Enter Groq API Key
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="gsk_..."
                    required
                  />
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                    Warning: Storing API keys in browser may expose them to
                    attackers.
                  </p>
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Key
                </motion.button>
              </motion.form>
            )}

            {/* Input Area */}
            <motion.div
              className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-lg"
              variants={fadeIn}
            >
              {/* {!localApiKey && !showKeyInput && (
                <motion.div className="mb-2 text-center" variants={fadeIn}>
                  <motion.button
                    onClick={() => setShowKeyInput(true)}
                    className="text-blue-600 dark:text-blue-400 text-sm underline"
                    whileHover={{ scale: 1.05 }}
                  >
                    Add API Key to Continue
                  </motion.button>
                </motion.div>
              )} */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <motion.input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your health question..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading || !localApiKey}
                  whileFocus={{ scale: 1.01 }}
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isLoading || !localApiKey}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? "✕" : "→"}
                </motion.button>
              </form>
              {/* {isLoading && (
                <motion.div
                  className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400"
                  variants={fadeIn}
                >
                  <motion.button
                    onClick={abortRequest}
                    className="text-red-500 dark:text-red-400"
                    whileHover={{ scale: 1.05 }}
                  >
                    Stop Generating
                  </motion.button>
                </motion.div>
              )} */}
              {messageBuffer.length > 0 && (
                <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {messageBuffer.length} message(s) in queue
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.button
            key="chat-button"
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={scale}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthChatbot;
