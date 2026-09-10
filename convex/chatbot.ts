"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const CANDIDATE_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-8b",
];

export const askGemini = action({
  args: {
    message: v.string(),
    surveyContext: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in Convex environment variables");
    }

    const systemPrompt = args.surveyContext
      ? `You are Sherpa AI, a helpful assistant for a survey analytics platform called InsightEase. Answer questions about the user's survey data. If the user asks a question not related to the survey, provide a helpful and reasonable general response instead of refusing to answer.\n\nCRITICAL INSTRUCTION: Format your response using clear paragraphs separated by blank lines. Feel free to use markdown like **bolding** and ## headings to organize your response.\n\nHere is context about their current survey: ${args.surveyContext}`
      : `You are Sherpa AI, a helpful assistant for a survey analytics platform called InsightEase. If the user asks a general question, provide a helpful and reasonable response.\n\nCRITICAL INSTRUCTION: Format your response using clear paragraphs separated by blank lines. Feel free to use markdown like **bolding** and ## headings to organize your response.`;

    let lastError = "";

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return reply as string;
          }
        } else {
          const errorText = await response.text();
          lastError = `Gemini API error (${model}): ${response.status} ${errorText}`;
          console.warn(`Model ${model} failed (${response.status}), trying fallback...`);
          // Try next model on 429 (quota/rate limit), 503 (overloaded), or 404 (model unavailable)
          if (response.status === 429 || response.status === 503 || response.status === 404 || response.status === 500) {
            continue;
          }
          break;
        }
      } catch (err) {
        lastError = String(err);
        console.warn(`Error reaching model ${model}, trying fallback...`, err);
        continue;
      }
    }

    throw new Error(
      lastError || "All Gemini models are currently busy or rate-limited. Please try again shortly."
    );
  },
});
