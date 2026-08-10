"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const askGemini = action({
  args: {
    message: v.string(),
    surveyContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = args.surveyContext
      ? `You are Sherpa AI, a helpful assistant for a survey analytics platform called InsightEase. Answer questions about the user's survey data. Here is context about their current survey: ${args.surveyContext}`
      : `You are Sherpa AI, a helpful assistant for a survey analytics platform called InsightEase.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nUser question: ${args.message}` },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error("No response from Gemini");
    }

    return reply as string;
  },
});
