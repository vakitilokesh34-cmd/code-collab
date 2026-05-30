import axios from "axios";
import { Buffer } from "buffer";

const JUDGE0_URL = "https://ce.judge0.com/submissions";

const languageMap = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
  c: 50,
  go: 60,
  rust: 73,
  ruby: 72,
  php: 68,
  typescript: 74,
  swift: 79,
  kotlin: 78,
  csharp: 51,
};

const decode = (data) => {
  return data ? Buffer.from(data, "base64").toString("utf-8") : null;
};

function prepareJavaCode(code) {
  let trimmed = code.trim();
  // Rename the first class declaration to Main (Judge0 expects Main.java)
  const hasClass = /(?:public\s+)?class\s+/.test(trimmed);
  if (hasClass) {
    trimmed = trimmed.replace(/(?:public\s+)?class\s+(\w+)/, (match, name) => {
      return match.replace(name, "Main");
    });
    // Add a main method if missing
    if (!/public\s+static\s+void\s+main\s*\(/.test(trimmed)) {
      const mainMethod = "\n  public static void main(String[] args) {}";
      const idx = trimmed.lastIndexOf("}");
      if (idx !== -1) {
        trimmed = trimmed.slice(0, idx) + mainMethod + "\n" + trimmed.slice(idx);
      }
    }
    return trimmed;
  }
  // No class — wrap bare code in a Main class with a main method
  return "public class Main {\n  public static void main(String[] args) {\n" + trimmed + "\n  }\n}";
}

export const executeCode = async ({ code, language, input }) => {
  try {
    const language_id = languageMap[language] || 63;
    let finalCode = code;
    if (language === "java") {
      finalCode = prepareJavaCode(code);
    }

    const response = await axios.post(
      `${JUDGE0_URL}?base64_encoded=true&wait=true`,
      {
        source_code: Buffer.from(finalCode).toString("base64"),
        language_id,
        stdin: Buffer.from(input || "").toString("base64"),
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = response.data;

    return {
      output: decode(result.stdout) || decode(result.compile_output) || decode(result.stderr) || "No output",
      error: decode(result.stderr) || null,
      compile_output: decode(result.compile_output) || null,
      status: result.status?.description || "Unknown",
    };
  } catch (error) {
    return {
      output: null,
      error: error.response?.data?.message || error.message || "Code execution failed",
      status: "Error",
    };
  }
};
