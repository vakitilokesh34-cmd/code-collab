import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatBox({
  messages,
  text,
  setText,
  sendMessage,
}) {

  return (

    <div className="h-full flex flex-col bg-[#0B1120]">

      {/* header */}
      <div className="h-16 border-b border-[#1E293B] flex items-center px-5">

        <h2 className="font-semibold text-white">
          Team Chat
        </h2>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {messages.length === 0 ? (

          <div className="text-gray-500 text-sm">
            No messages yet
          </div>

        ) : (

          messages.map(
            (message, index) => (

              <ChatMessage
                key={index}
                message={message}
              />
            )
          )
        )}
      </div>

      {/* input */}
      <ChatInput
        text={text}
        setText={setText}
        sendMessage={sendMessage}
      />
    </div>
  );
}