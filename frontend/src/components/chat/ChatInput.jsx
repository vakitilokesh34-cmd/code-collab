import {
  Send,
} from "lucide-react";

export default function ChatInput({
  text,
  setText,
  sendMessage,
}) {

  // enter key send
  const handleKeyDown =
    (e) => {

      if (
        e.key === "Enter"
      ) {

        e.preventDefault();

        sendMessage();
      }
    };

  return (

    <div className="p-4 border-t border-[#1E293B] flex gap-3">

      {/* input */}
      <input
        value={text}

        onChange={(e) =>
          setText(
            e.target.value
          )
        }

        onKeyDown={
          handleKeyDown
        }

        placeholder="Message..."

        className="flex-1 h-12 bg-[#111827] border border-[#1E293B] rounded-xl px-4 outline-none text-white focus:border-[#12F7A0]"
      />

      {/* send */}
      <button
        onClick={sendMessage}

        className="w-12 h-12 rounded-xl bg-[#12F7A0] text-black flex items-center justify-center hover:opacity-90"
      >

        <Send size={18} />
      </button>
    </div>
  );
}