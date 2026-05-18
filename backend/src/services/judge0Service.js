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

export const executeCode = async ({ code, language, input }) => {
  try {
    const language_id = languageMap[language] || 63;

    const response = await axios.post(
      `${JUDGE0_URL}?base64_encoded=true&wait=true`,
      {
        source_code: Buffer.from(code).toString("base64"),
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
