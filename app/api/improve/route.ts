import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text?.trim()) {
      return Response.json(
        { error: "Question text is required" },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Rewrite the following question so it is clear, professional, and grammatically correct. Return ONLY the improved question.

Question:
${text}`,
    });

    return Response.json({
      improved: response.text,
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    return Response.json(
      {
        error: "Failed to improve question",
      },
      { status: 500 }
    );
  }
}