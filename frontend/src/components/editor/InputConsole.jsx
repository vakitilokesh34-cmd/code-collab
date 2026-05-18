export default function InputConsole({
  input,
  setInput,
}) {

  return (

    <div className="h-full flex flex-col bg-[#050816]">

      <div className="text-sm text-gray-400 p-3 border-b border-[#1E293B]">
        Input
      </div>

      <textarea
        value={input}

        onChange={(e) =>
          setInput(
            e.target.value
          )
        }

        placeholder="Custom input..."

        className="flex-1 bg-transparent outline-none resize-none p-4 text-white"
      />
    </div>
  );
}