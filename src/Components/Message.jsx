import geminiIcon from "../assets/gemini.svg";
import React from 'react'

function Message({ message }) {
  return (
    <div>
         <div id={message.id} className={`message ${message.role}-message ${message.loading ? "loading" : ""} ${message.error ? "error" : ""}`}>
      {message.role === "bot" && <img className="avatar" src={geminiIcon} alt="Bot Avatar" />}
      <p className="text">{message.content}</p>
    </div>
    </div>
  )
}
export default Message;