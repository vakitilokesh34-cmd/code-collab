export default function RunButton({
  runCode,
}) {

  return (

    <button
      onClick={runCode}

      className="bg-[#12F7A0] text-black px-6 py-2 rounded-xl font-bold hover:opacity-90"
    >
      ▶ Run
    </button>
  );
}