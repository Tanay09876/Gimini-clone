import React from "react";
import Sidebar from "./Components/Sidebar";
import PromptForm from "./Components/PromptForm";
import Message from "./Components/Message";
import { Menu } from "lucide-react";
import gemini from "./assets/gemini.svg";
import useChat from "./hooks/useChat";

import "./index.css";
import "./App.css";

const App = () => {
  const {
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
  } = useChat();

  return (
    <div className={`app-container ${theme === "light" ? "light-theme" : "dark-theme"}`}>
      <div
        className={`overlay ${isSidebarOpen ? "show" : "hide"}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <Sidebar
        conversations={conversations}
        setConversations={setConversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        theme={theme}
        setTheme={setTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="main-container">
        <header className="main-header">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="sidebar-toggle"
          >
            <Menu size={18} />
          </button>
        </header>

        {currentConversation.messages.length === 0 ? (
          <div className="welcome-container">
            <img className="welcome-logo" src={gemini} alt="Gemini Logo" />
            <h1 className="welcome-heading">Message Gemini</h1>
            <p className="welcome-text">Ask me anything about any topic. I'm here to help!</p>
          </div>
        ) : (
          <div className="messages-container" ref={messagesContainerRef}>
            {currentConversation.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </div>
        )}

        <div className="prompt-container">
          <div className="prompt-wrapper">
            <PromptForm
              conversations={conversations}
              setConversations={setConversations}
              activeConversation={activeConversation}
              generateResponse={generateResponse}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
          <p className="disclaimer-text">Gemini can make mistakes, so double-check it.</p>
        </div>
      </main>
    </div>
  );
};

export default App;
