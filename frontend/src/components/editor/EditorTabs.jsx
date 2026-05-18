export default function EditorTabs({
  files,
  activeFile,
  setActiveFile,
}) {

  return (

    <div className="h-14 border-b border-[#1E293B] flex items-center px-3 gap-2 overflow-x-auto">

      {files.map((file, index) => (

        <button
          key={index}

          onClick={() =>
            setActiveFile(file)
          }

          className={`px-4 py-2 rounded-t-xl text-sm whitespace-nowrap
          
          ${
            activeFile?.name ===
            file.name

              ? "bg-[#111827] text-white"

              : "bg-[#0B1120] text-gray-400"
          }
          `}
        >
          {file.name}
        </button>
      ))}
    </div>
  );
}