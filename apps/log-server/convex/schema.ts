import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fingerPrintId: v.string(),
  }),
  logs: defineTable({
    issue: v.string(),
    detail: v.string(),
    level: v.string(),
    recommendation: v.string(),
    // Additional properties for query in the UI.
    method: v.string(),
    endpoint: v.string(),
    fingerPrintId: v.string(),
    tags: v.array(v.string()),
  }).index("by_fingerprintId", ["fingerPrintId"]),
});
