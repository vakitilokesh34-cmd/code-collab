export default function OutputConsole({
  output,
}) {

  return (

    <div className="h-full bg-black p-4 overflow-y-auto">

      <div className="text-sm text-gray-400 mb-3">
        Output
      </div>

      <pre className="text-[#12F7A0] whitespace-pre-wrap">
        {output ||
          "Run code to see output..."}
      </pre>
    </div>
  );
}