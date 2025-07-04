import { useEffect, useRef, useState } from "react";
import React from 'react'

function useChat() {
   const [isLoading, setIsLoading] = useState(false);
  const typingInterval = useRef(null);
  const messagesContainerRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem("conversations");
      return saved ? JSON.parse(saved) : [{ id: "default", title: "New Chat", messages: [] }];
    } catch {
      return [{ id: "default", title: "New Chat", messages: [] }];
    }
  });

  const [activeConversation, setActiveConversation] = useState(() => {
    return localStorage.getItem("activeConversation") || "default";
  });

  const currentConversation =
    conversations.find((c) => c.id === activeConversation) || conversations[0];

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("activeConversation", activeConversation);
  }, [activeConversation]);

  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversation]);

  const typingEffect = (text, messageId) => {
    const textElement = document.querySelector(`#${messageId} .text`);
    if (!textElement) return;

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content: "", loading: true } : msg
              ),
            }
          : conv
      )
    );

    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;
    let currentText = "";
    clearInterval(typingInterval.current);

    typingInterval.current = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
        textElement.textContent = currentText;

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, content: currentText, loading: true }
                      : msg
                  ),
                }
              : conv
          )
        );

        scrollToBottom();
      } else {
        clearInterval(typingInterval.current);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, content: currentText, loading: false }
                      : msg
                  ),
                }
              : conv
          )
        );
        setIsLoading(false);
      }
    }, 40);
  };

  const updateBotMessage = (botId, content, isError = false) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === botId
                  ? { ...msg, content, loading: false, error: isError }
                  : msg
              ),
            }
          : conv
      )
    );
  };

  const generateResponse = async (conversation, botMessageId) => {
    const formattedMessages = conversation.messages?.map((msg) => ({
      role: msg.role === "bot" ? "model" : msg.role,
      parts: [{ text: msg.content }],
    }));

    try {
      const res = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error.message);

      const responseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .trim();

      typingEffect(responseText, botMessageId);
    } catch (error) {
      setIsLoading(false);
      updateBotMessage(botMessageId, error.message, true);
    }
  };

  return {
       isLoading,
    setIsLoading,
    messagesContainerRef,
    isSidebarOpen,
    setIsSidebarOpen,
    theme,
    setTheme,
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    currentConversation,
    generateResponse,

}
};


export default useChat;
