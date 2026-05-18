export default function ChatMessage({
  message,
}) {

  return (

    <div className="bg-[#111827] border border-[#1E293B] p-4 rounded-2xl">

      {/* sender */}
      <div className="flex items-center justify-between mb-2">

        <span className="text-[#12F7A0] font-semibold">
          {message.sender}
        </span>

        {message.createdAt && (

          <span className="text-xs text-gray-500">

            {new Date(
              message.createdAt
            ).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* text */}
      <p className="text-gray-300 whitespace-pre-wrap break-words">
        {message.text}
      </p>
    </div>
  );
}