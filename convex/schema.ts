import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const questionValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("multiple_choice"),
    v.literal("rating"),
    v.literal("long_text"),
    v.literal("dropdown"),
    v.literal("date"),
    v.literal("page_break"),
  ),
  title: v.string(),
  options: v.optional(v.array(v.string())),
  ratingMax: v.optional(v.number()),
  suggestion: v.optional(v.string()),
  required: v.optional(v.boolean()),
});

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    ...authTables.users.validator.fields,
    role: v.optional(
      v.union(
        v.literal("student"),
        v.literal("lecturer"),
        v.literal("researcher"),
        v.literal("owner"),
      ),
    ),
  }).index("email", ["email"]),

  surveys: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    questions: v.array(questionValidator),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("closed"),
    ),
    publicSlug: v.optional(v.string()),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_publicSlug", ["publicSlug"]),

  surveyResponses: defineTable({
    surveyId: v.id("surveys"),
    answers: v.record(v.string(), v.union(v.string(), v.number())),
  }).index("by_survey", ["surveyId"]),

  activityLog: defineTable({
    userId: v.id("users"),
    surveyId: v.optional(v.id("surveys")),
    type: v.union(
      v.literal("survey_edited"),
      v.literal("survey_published"),
      v.literal("survey_closed"),
      v.literal("survey_reopened"),
      v.literal("survey_goal_reached"),
      v.literal("response_received"),
    ),
    surveyTitle: v.string(),
  }).index("by_user", ["userId"]),
});

export default schema;
