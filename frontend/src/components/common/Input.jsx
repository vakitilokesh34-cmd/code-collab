export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
}) {

  return (

    <input
      type={type}

      placeholder={placeholder}

      value={value}

      onChange={onChange}

      className={`w-full h-12 px-4 rounded-xl bg-[#111827] border border-[#1E293B] text-white outline-none focus:border-[#12F7A0] ${className}`}
    />
  );
}