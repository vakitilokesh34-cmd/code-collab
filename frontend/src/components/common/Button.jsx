export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}) {

  const variants = {

    primary:
      "bg-[#12F7A0] text-black hover:opacity-90",

    secondary:
      "bg-[#111827] border border-[#1E293B] text-white hover:border-[#12F7A0]",

    danger:
      "bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/10",
  };

  return (

    <button
      type={type}

      onClick={onClick}

      disabled={disabled}

      className={`h-12 px-5 rounded-xl font-semibold transition disabled:opacity-50 ${variants[variant]} ${className}`}
    >

      {children}
    </button>
  );
}