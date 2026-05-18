export default function FileExplorer({
  files,
  activeFile,
  setActiveFile,
  createFile,
}) {

  return (

    <div className="h-full flex flex-col">

      {/* header */}
      <div className="flex items-center justify-between mb-4">

        <h2 className="text-sm uppercase tracking-widest text-gray-400">
          Files
        </h2>

        <button
          onClick={createFile}
          className="text-[#12F7A0] text-sm"
        >
          + New
        </button>
      </div>

      {/* files */}
      <div className="space-y-2 overflow-y-auto">

        {files.map((file, index) => (

          <div
            key={index}
            onClick={() =>
              setActiveFile(file)
            }

            className={`p-3 rounded-xl cursor-pointer border transition
              
              ${
                activeFile?.name ===
                file.name

                  ? "bg-[#111827] border-[#12F7A0]"

                  : "bg-[#0F172A] border-[#1E293B]"
              }
            `}
          >
            {file.name}
          </div>
        ))}
      </div>
    </div>
  );
}