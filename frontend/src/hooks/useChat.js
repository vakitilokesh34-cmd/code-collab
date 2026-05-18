import {
  useState,
} from "react";

export default function useChat() {

  // chat messages
  const [messages, setMessages] =
    useState([]);

  // input text
  const [text, setText] =
    useState("");

  // add message
  const addMessage =
    (message) => {

      setMessages(
        (prev) => [
          ...prev,
          message,
        ]
      );
    };

  // clear messages
  const clearMessages =
    () => {

      setMessages([]);
    };

  return {

    messages,
    setMessages,

    text,
    setText,

    addMessage,
    clearMessages,
  };
}