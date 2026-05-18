import {
  Copy,
} from "lucide-react";

export default function ShareRoom({
  roomId,
}) {

  // copy room id
  const copyRoom =
    async () => {

      await navigator
        .clipboard
        .writeText(roomId);

      alert(
        "Room ID copied"
      );
    };

  return (

    <button
      onClick={copyRoom}

      className="flex items-center gap-2 bg-[#111827] border border-[#1E293B] px-4 py-2 rounded-xl hover:border-[#12F7A0]"
    >

      <Copy size={16} />

      Share
    </button>
  );
}