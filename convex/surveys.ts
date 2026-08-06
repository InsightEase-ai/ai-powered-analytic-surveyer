import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { questionValidator } from "./schema";

export const recentSurveys = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const surveys = await ctx.db
      .query("surveys")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const recent = surveys
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    const withCounts = await Promise.all(
      recent.map(async (survey) => {
        const responses = await ctx.db
          .query("surveyResponses")
          .withIndex("by_survey", (q) => q.eq("surveyId", survey._id))
          .collect();
        return { ...survey, responseCount: responses.length };
      }),
    );

    return withCounts;
  },
});

export const surveyCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const surveys = await ctx.db
      .query("surveys")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    return surveys.length;
  },
});

export const responsesThisMonth = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const surveys = await ctx.db
      .query("surveys")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).getTime();

    const counts = await Promise.all(
      surveys.map(async (survey) => {
        const responses = await ctx.db
          .query("surveyResponses")
          .withIndex("by_survey", (q) => q.eq("surveyId", survey._id))
          .collect();
        return responses.filter((r) => r._creationTime >= startOfMonth).length;
      }),
    );

    return counts.reduce((sum, c) => sum + c, 0);
  },
});

export const avgAnswerRate = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const surveys = await ctx.db
      .query("surveys")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    let totalRate = 0;
    let responseCount = 0;

    for (const survey of surveys) {
      const realQuestions = survey.questions.filter(
        (q) => q.type !== "page_break",
      );
      if (realQuestions.length === 0) continue;

      const responses = await ctx.db
        .query("surveyResponses")
        .withIndex("by_survey", (q) => q.eq("surveyId", survey._id))
        .collect();

      for (const response of responses) {
        const answered = realQuestions.filter(
          (q) =>
            response.answers[q.id] !== undefined &&
            response.answers[q.id] !== "",
        ).length;
        totalRate += answered / realQuestions.length;
        responseCount += 1;
      }
    }

    if (responseCount === 0) return 0;
    return Math.round((totalRate / responseCount) * 100);
  },
});

export const recentActivity = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const activity = await ctx.db
      .query("activityLog")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return activity
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5);
  },
});

export const getSurveyById = query({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const survey = await ctx.db.get(args.id);
    if (!survey || survey.ownerId !== userId) return null; // don't leak other users' surveys

    return survey;
  },
});

export const createSurvey = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    questions: v.array(questionValidator), // reuse the same validator from schema.ts — see note below
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const publicSlug =
      args.status === "published"
        ? `${args.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .slice(0, 40)}-${Math.random().toString(36).slice(2, 8)}`
        : undefined;

    const surveyId = await ctx.db.insert("surveys", {
      ownerId: userId,
      title: args.title,
      description: args.description,
      questions: args.questions,
      status: args.status,
      publicSlug,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      surveyId,
      type: args.status === "published" ? "survey_published" : "survey_edited",
      surveyTitle: args.title,
    });

    return await ctx.db.get(surveyId);
  },
});

export const updateSurvey = mutation({
  args: {
    id: v.id("surveys"),
    title: v.string(),
    description: v.string(),
    questions: v.array(questionValidator),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.ownerId !== userId) {
      throw new Error("Survey not found");
    }

    // only generate a new slug the first time a draft becomes published
    const publicSlug =
      existing.publicSlug ??
      (args.status === "published"
        ? `${args.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .slice(0, 40)}-${Math.random().toString(36).slice(2, 8)}`
        : undefined);

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      questions: args.questions,
      status: args.status,
      publicSlug,
      updatedAt: Date.now(),
    });

    const justPublished =
      existing.status !== "published" && args.status === "published";

    await ctx.db.insert("activityLog", {
      userId,
      surveyId: args.id,
      type: justPublished ? "survey_published" : "survey_edited",
      surveyTitle: args.title,
    });

    return await ctx.db.get(args.id);
  },
});

export const getResponsesForSurvey = query({
  args: { surveyId: v.id("surveys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const survey = await ctx.db.get(args.surveyId);
    if (!survey || survey.ownerId !== userId) return []; // same ownership check as getSurveyById

    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_survey", (q) => q.eq("surveyId", args.surveyId))
      .collect();

    return responses.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const closeSurvey = mutation({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.ownerId !== userId) {
      throw new Error("Survey not found");
    }

    await ctx.db.patch(args.id, {
      status: "closed",
      closedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      surveyId: args.id,
      type: "survey_closed",
      surveyTitle: existing.title,
    });

    return await ctx.db.get(args.id);
  },
});

export const reopenSurvey = mutation({
  args: { id: v.id("surveys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.ownerId !== userId) {
      throw new Error("Survey not found");
    }

    await ctx.db.patch(args.id, {
      status: "published",
      closedAt: undefined,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activityLog", {
      userId,
      surveyId: args.id,
      type: "survey_reopened", // ← was "survey_edited"
      surveyTitle: existing.title,
    });

    return await ctx.db.get(args.id);
  },
});

export const getSurveyBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const survey = await ctx.db
      .query("surveys")
      .withIndex("by_publicSlug", (q) => q.eq("publicSlug", args.slug))
      .unique();

    return survey;
  },
});

export const submitSurveyResponse = mutation({
  args: {
    surveyId: v.id("surveys"),
    answers: v.record(v.string(), v.union(v.string(), v.number())),
  },
  handler: async (ctx, args) => {
    // no auth check — respondents are anonymous members of the public
    const survey = await ctx.db.get(args.surveyId);
    if (!survey) throw new Error("Survey not found");
    if (survey.status === "closed")
      throw new Error("This survey is no longer accepting responses");

    await ctx.db.insert("surveyResponses", {
      surveyId: args.surveyId,
      answers: args.answers,
    });

    await ctx.db.insert("activityLog", {
      userId: survey.ownerId, // log to the survey's owner, not the (anonymous) respondent
      surveyId: args.surveyId,
      type: "response_received",
      surveyTitle: survey.title,
    });

    return null;
  },
});