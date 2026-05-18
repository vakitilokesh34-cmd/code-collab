export default function LanguageSelector({
  language,
  setLanguage,
}) {

  return (

    <select
      value={language}

      onChange={(e) =>
        setLanguage(
          e.target.value
        )
      }

      className="bg-[#111827] border border-[#1E293B] px-4 py-2 rounded-xl outline-none"
    >

      <option value="javascript">
        JavaScript
      </option>

      <option value="python">
        Python
      </option>

      <option value="java">
        Java
      </option>

      <option value="cpp">
        C++
      </option>
    </select>
  );
}