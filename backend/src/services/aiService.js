import OpenAI from "openai";

const SYSTEM_PROMPT = `You are an expert programming assistant integrated into a collaborative code editor.
Your job is to help users understand and fix code errors.
You have access to the user's code, the programming language, any error messages, and stdin input.
Provide concise, actionable solutions. Include code snippets where helpful.
Keep responses under 200 words. Be direct and friendly.`;

export async function getAIResponse({ code, language, error, prompt }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      response:
        "AI assistant is not configured. Set OPENAI_API_KEY in the backend environment to enable it.",
    };
  }

  try {
    const openai = new OpenAI({ apiKey });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          `Language: ${language}`,
          error ? `Error:\n\`\`\`\n${error}\n\`\`\`` : "",
          code ? `Code:\n\`\`\`${language}\n${code}\n\`\`\`` : "",
          prompt,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.3,
    });

    return {
      response:
        completion.choices[0]?.message?.content ||
        "I couldn't generate a response. Please try again.",
    };
  } catch (err) {
    console.error("AI Service Error:", err.message);
    return {
      response: `AI service error: ${err.message}`,
    };
  }
}
