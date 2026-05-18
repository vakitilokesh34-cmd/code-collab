export default function OnlineUser({
  user,
}) {

  return (

    <div className="flex items-center gap-3 bg-[#111827] border border-[#1E293B] px-4 py-3 rounded-xl">

      {/* avatar */}
      <div className="w-10 h-10 rounded-full bg-[#12F7A0] text-black font-bold flex items-center justify-center uppercase">

        {user.username?.charAt(0)}
      </div>

      {/* info */}
      <div className="flex-1">

        <div className="text-white font-medium">
          {user.username}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">

          <div className="w-2 h-2 rounded-full bg-[#12F7A0]" />

          Online
        </div>
      </div>
    </div>
  );
}