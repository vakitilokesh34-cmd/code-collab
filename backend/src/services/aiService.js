import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert programming assistant integrated into a collaborative code editor.
Your job is to help users understand and fix code errors.
You have access to the user's code, the programming language, any error messages, and stdin input.
Provide concise, actionable solutions. Include code snippets where helpful.
Keep responses under 200 words. Be direct and friendly.`;

const fixes = {
  js: {
    syntax: [
      "**Syntax Error** — likely a missing bracket, parenthesis, or semicolon.",
      "```js\n// Check for unbalanced braces:\nfunction greet(name) {\n  return `Hello ${name}`;\n} // <-- missing this brace\n```",
      "**Quick checks:** every `{` needs `}`, every `(` needs `)`, every `[` needs `]`.",
    ],
    reference: [
      "**Reference Error** — variable or function not defined in scope.",
      "```js\n// ✅ Declare before using:\nconst message = 'Hello';\nconsole.log(message);\n\n// ❌ Wrong:\nconsole.log(msg); // msg is not defined\n```",
      "Check spelling, variable scope, and import/export statements.",
    ],
    type: [
      "**Type Error** — value is not what you expected (often `undefined` or `null`).",
      "```js\n// ✅ Guard against null:\nif (user && user.name) {\n  console.log(user.name);\n}\n\n// ❌ Dangerous:\nconsole.log(user.name); // if user is undefined, this crashes\n```",
    ],
    import: [
      "**Import/Module Error** — file not found or package missing.",
      "```js\n// ✅ Correct path:\nimport { helper } from './utils/helper.js';\n\n// ❌ Wrong path:\nimport { helper } from './util/helper.js'; // typo: 'util' instead of 'utils'\n```",
      "Make sure the package is installed: `npm install <package>`",
    ],
    generic: [
      "**Error in your code.** Here's how to debug:",
      "1. Read the error line & column — it pinpoints the exact location.",
      "2. Add `console.log()` before the crash to inspect values.",
      "3. Check for off-by-one errors in loops and array access.",
    ],
  },
  python: {
    syntax: [
      "**SyntaxError** — Python is strict about indentation and colons.",
      "```python\n# ✅ Correct:\ndef greet(name):\n    return f'Hello {name}'\n\n# ❌ Missing colon or bad indent:\ndef greet(name)  # missing :\n  return f'Hello {name}'  # inconsistent indent\n```",
      "Use 4 spaces for indentation consistently.",
    ],
    reference: [
      "**NameError** — variable or function not defined.",
      "```python\n# ✅ Define before use:\nmessage = 'Hello'\nprint(message)\n\n# ❌ Typo:\nprint(mesage)  # NameError: name 'mesage' is not defined\n```",
    ],
    type: [
      "**TypeError** — wrong type for an operation.",
      "```python\n# ✅ Convert types explicitly:\nnumber = int('42')\nresult = number + 10\n\n# ❌ Mixing types:\nresult = '42' + 10  # TypeError: can only concatenate str (not int) to str\n```",
    ],
    import: [
      "**ImportError** — module not found.",
      "```python\n# ✅ Install first:\n# pip install requests\nimport requests\n\n# ❌ Misspelled module:\nimport requsts  # ImportError\n```",
    ],
    generic: [
      "**Error in your Python code.** Debug steps:",
      "1. Check the line number in the traceback — it points to the exact line.",
      "2. Use `print()` or `logging` to inspect variable values.",
      "3. Verify indentation — Python uses spaces consistently.",
    ],
  },
  default: {
    syntax: [
      "**Syntax Error** — check for missing brackets `{}`, parentheses `()`, or semicolons `;`.",
      "Every opening symbol must have a matching closing symbol.",
    ],
    reference: [
      "**Reference Error** — a variable or function is not defined.",
      "Check the spelling and make sure it's declared in the current scope.",
    ],
    type: [
      "**Type Error** — a value is `null`, `undefined`, or the wrong type.",
      "Add a guard: `if (value !== null && value !== undefined)` before accessing properties.",
    ],
    import: [
      "**Module/Import Error** — the dependency is missing or the path is wrong.",
      "Double-check the file path and that the package is installed.",
    ],
    generic: [
      "**Error detected.** Debug steps:",
      "1. Look at the line number in the error message.",
      "2. Print/inspect variable values just before the failing line.",
      "3. Check for off-by-one errors in loops and array indices.",
    ],
  },
};

function detectFixSet(language) {
  const lang = (language || "").toLowerCase();
  if (["javascript", "js", "node", "typescript", "ts", "jsx", "tsx"].some(l => lang.includes(l))) return fixes.js;
  if (["python", "py"].some(l => lang.includes(l))) return fixes.python;
  return fixes.default;
}

function matchErrorType(lowerError) {
  if (lowerError.includes("syntaxerror") || lowerError.includes("unexpected token") || lowerError.includes("syntax error")) return "syntax";
  if (lowerError.includes("referenceerror") || lowerError.includes("is not defined") || lowerError.includes("nameerror")) return "reference";
  if (lowerError.includes("typeerror") || lowerError.includes("cannot read property") || lowerError.includes("cannot read properties") || lowerError.includes("undefined")) return "type";
  if (lowerError.includes("import") || lowerError.includes("module") || lowerError.includes("require") || lowerError.includes("modulenotfound") || lowerError.includes("importerror")) return "import";
  return "generic";
}

function extractCodeBlock(code, language) {
  if (!code || !code.trim()) return null;
  const lines = code.split("\n").slice(0, 15);
  return lines.map(l => `  ${l}`).join("\n");
}

function fallbackResponse({ code, language, error, prompt }) {
  const fixSet = detectFixSet(language);
  const lowerError = (error || "").toLowerCase();
  const errorType = error ? matchErrorType(lowerError) : "generic";
  const tips = fixSet[errorType] || fixSet.generic;
  const lines = [...tips];

  if (code && error) {
    const snippet = extractCodeBlock(code, language);
    if (snippet) {
      lines.push("");
      lines.push("**Your code (first 15 lines):**");
      lines.push("```" + (language || ""));
      lines.push(snippet);
      lines.push("```");
    }
  }

  if (prompt && prompt !== "help" && prompt !== "fix this") {
    lines.push("");
    lines.push(`> "${prompt}"`);
  }

  return { response: lines.join("\n") };
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
