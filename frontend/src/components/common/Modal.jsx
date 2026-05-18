export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}) {

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      {/* modal */}
      <div className="w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">

        {/* header */}
        <div className="h-16 border-b border-[#1E293B] px-6 flex items-center justify-between">

          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* body */}
        <div className="p-6 text-white">

          {children}
        </div>
      </div>
    </div>
  );
}