import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert programming assistant integrated into a collaborative code editor.
Your job is to help users understand and fix code errors.
You have access to the user's code, the programming language, any error messages, and stdin input.
Provide concise, actionable solutions. Include code snippets where helpful.
Keep responses under 200 words. Be direct and friendly.`;

function fallbackResponse({ code, language, error, prompt }) {
  const lines = [];

  if (error) {
    const lower = error.toLowerCase();

    if (lower.includes("syntaxerror") || lower.includes("unexpected token")) {
      lines.push("Syntax Error detected.");
      lines.push("Check for missing brackets `{}`, parentheses `()`, or semicolons `;`.");
      lines.push("Look at the line indicated in the error \u2014 a missing closing brace is a common cause.");
    } else if (lower.includes("referenceerror") || lower.includes("is not defined")) {
      lines.push("Reference Error \u2014 variable not found.");
      lines.push("Make sure the variable or function name is spelled correctly and is in scope.");
      lines.push("If it's from another file, check that it's been imported/exported properly.");
    } else if (lower.includes("typeerror") || lower.includes("cannot read property") || lower.includes("undefined")) {
      lines.push("Type Error \u2014 unexpected value type.");
      lines.push("A variable is `undefined` or `null` when you tried to access a property on it.");
      lines.push("Use `console.log()` to inspect the value before the failing line.");
    } else if (lower.includes("import") || lower.includes("module") || lower.includes("require")) {
      lines.push("Module/Import Error.");
      lines.push("Check that the module path is correct and the package is installed.");
      lines.push("For local files, ensure you're using the right extension (`.js`, `.jsx`, `.ts`).");
    } else if (lower.includes("out of memory") || lower.includes("heap")) {
      lines.push("Out of Memory.");
      lines.push("Your code might have an infinite loop or is processing too much data at once.");
      lines.push("Check for `while(true)` loops or recursive functions without a base case.");
    } else if (lower.includes("timeout") || lower.includes("timed out")) {
      lines.push("Execution Timeout.");
      lines.push("The code took too long to run. Look for infinite loops or inefficient algorithms.");
    } else {
      lines.push("Error detected.");
      lines.push("Read the error message carefully \u2014 it usually points to the exact line and column.");
      lines.push("Try adding `console.log()` statements to trace the values before the crash.");
    }
  }

  if (!error && code) {
    lines.push("Tip: Make sure your logic handles edge cases (empty input, null values, unexpected types).");
  }

  if (!error && !code) {
    lines.push("Describe what you're trying to do, or paste your code/error for specific help.");
  }

  return { response: lines.join("\n\n") };
}

export async function getAIResponse({ code, language, error, prompt }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackResponse({ code, language, error, prompt });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const parts = [
      { text: SYSTEM_PROMPT },
      { text: `Language: ${language}` },
    ];

    if (error) parts.push({ text: `Error:\n\`\`\`\n${error}\n\`\`\`` });
    if (code) parts.push({ text: `Code:\n\`\`\`${language}\n${code}\n\`\`\`` });
    parts.push({ text: prompt });

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
    });

    const response = result.response?.text?.() || "I couldn't generate a response. Please try again.";
    return { response };
  } catch (err) {
    console.error("AI Service Error:", err.message);
    return fallbackResponse({ code, language, error, prompt });
  }
}
