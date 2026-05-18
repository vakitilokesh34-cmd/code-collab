export default function CursorTracker({
  cursors,
}) {

  return (

    <div className="absolute inset-0 pointer-events-none z-50">

      {cursors.map(
        (cursor, index) => (

          <div
            key={index}

            className="absolute flex items-center gap-2"

            style={{
              top: cursor.top,
              left: cursor.left,
            }}
          >

            {/* cursor */}
            <div className="w-[2px] h-6 bg-[#12F7A0]" />

            {/* label */}
            <div className="bg-[#12F7A0] text-black text-xs px-2 py-1 rounded-md font-semibold whitespace-nowrap">

              {cursor.username}
            </div>
          </div>
        )
      )}
    </div>
  );
}