import LanguageSelector from "../editor/LanguageSelector";
import RunButton from "../editor/RunButton";
import ShareRoom from "./ShareRoom";

export default function RoomHeader({
  roomId,
  language,
  setLanguage,
  runCode,
  leaveRoom,
}) {

  return (

    <div className="h-16 border-b border-[#1E293B] bg-[#0B1120] px-6 flex items-center justify-between">

      {/* left */}
      <div className="flex items-center gap-4">

        {/* logo */}
        <div className="text-[#12F7A0] text-2xl font-bold">
          CodeCollab
        </div>

        {/* room badge */}
        <div className="bg-[#111827] border border-[#1E293B] px-4 py-2 rounded-xl text-sm">

          ROOM #
          {roomId.slice(0, 6)}
        </div>

        {/* live */}
        <div className="text-[#12F7A0] text-sm">
          ● Live
        </div>
      </div>

      {/* right */}
      <div className="flex items-center gap-4">

        {/* language */}
        <LanguageSelector
          language={language}
          setLanguage={
            setLanguage
          }
        />

        {/* share */}
        <ShareRoom
          roomId={roomId}
        />

        {/* run */}
        <RunButton
          runCode={runCode}
        />

        {/* leave */}
        <button
          onClick={leaveRoom}

          className="bg-red-500/20 border border-red-500 text-red-400 px-5 py-2 rounded-xl hover:bg-red-500/10"
        >
          Leave
        </button>
      </div>
    </div>
  );
}