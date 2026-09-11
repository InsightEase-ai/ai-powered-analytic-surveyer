"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
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

    const trimmedMessage = args.message.trim();
    const isGreeting = /^(?:hi|hello|hey|greetings|howdy|good\s*(?:morning|afternoon|evening|day)|what's\s*up|sup|who\s*are\s*you|introduce\s*yourself|what\s*is\s*your\s*name)\b[!?.]*$/i.test(
      trimmedMessage,
    );

    const systemPrompt = args.surveyContext
      ? `You are Sherpa AI, an analytics assistant for the survey analytics platform InsightEase. Answer questions about the user's survey data directly and concisely. If the user asks a question not related to the survey, provide a helpful and reasonable general response.

CRITICAL INSTRUCTIONS:
1. GREETING RULE: Do NOT start your response with an introduction, greeting, or boilerplate (such as "Hello! I am Sherpa AI, your assistant here at InsightEase."). Jump straight into answering the user's question directly. ONLY include a greeting or introduce yourself if the user specifically greets you (e.g., says "hello", "hi", "hey").
2. FORMATTING: Format your response using clear paragraphs separated by blank lines. Feel free to use markdown like **bolding** and ## headings to organize your response.

Here is context about their current survey:
${args.surveyContext}`
      : `You are Sherpa AI, an analytics assistant for the survey analytics platform InsightEase. If the user asks a general question, provide a helpful and reasonable response.

CRITICAL INSTRUCTIONS:
1. GREETING RULE: Do NOT start your response with an introduction, greeting, or boilerplate (such as "Hello! I am Sherpa AI, your assistant here at InsightEase."). Jump straight into answering the user's question directly. ONLY include a greeting or introduce yourself if the user specifically greets you (e.g., says "hello", "hi", "hey").
2. FORMATTING: Format your response using clear paragraphs separated by blank lines. Feel free to use markdown like **bolding** and ## headings to organize your response.`;

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
          let reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply && typeof reply === "string") {
            if (!isGreeting) {
              // Strip boilerplate introduction if model still prepends it
              reply = reply
                .replace(
                  /^(?:(?:Hello|Hi|Hey|Greetings)[!,.]?\s*)?(?:I am|I'm|This is)\s+Sherpa AI(?:,\s*your assistant here at InsightEase)?(?:[.,!]|(?:\s*—|\s*-\s*))\s*/i,
                  "",
                )
                .trim();
            }
            return reply;
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
