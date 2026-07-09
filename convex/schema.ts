import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    ...authTables.users.validator.fields, // keeps all the default auth fields
    role: v.optional(
      v.union(
        // adds your custom role field
        v.literal("student"),
        v.literal("lecturer"),
        v.literal("researcher"),
        v.literal("owner"),
      ),
    ),
  }).index("email", ["email"]), // keeps the required email index
});

export default schema;
