import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert programming assistant integrated into a collaborative code editor.
Your job is to help users understand and fix code errors.
You have access to the user's code, the programming language, any error messages, and stdin input.
Provide concise, actionable solutions. Include code snippets where helpful.
Keep responses under 200 words. Be direct and friendly.`;

export async function getAIResponse({ code, language, error, prompt }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      response:
        "AI assistant is not configured. Set GEMINI_API_KEY in the backend environment to enable it. Get a free key at https://aistudio.google.com/apikey",
    };
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
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.3,
      },
    });

    const response = result.response?.text?.() || "I couldn't generate a response. Please try again.";

    return { response };
  } catch (err) {
    console.error("AI Service Error:", err.message);
    return {
      response: `AI service error: ${err.message}`,
    };
  }
}
