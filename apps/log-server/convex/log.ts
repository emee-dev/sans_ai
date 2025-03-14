import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createLog = mutation({
  args: {
    issue: v.string(),
    detail: v.string(),
    level: v.string(),
    recommendation: v.string(),
    // Additional properties for query in the UI.
    method: v.string(),
    endpoint: v.string(),
    fingerPrintId: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const db = await ctx.db.insert("logs", {
      issue: args.issue,
      detail: args.detail,
      level: args.level.toLowerCase(),
      recommendation: args.recommendation,
      method: args.method.toLowerCase(),
      endpoint: args.endpoint.toLowerCase(),
      fingerPrintId: args.fingerPrintId,
      tags: args.tags.map((item) => item.toLowerCase()),
    });

    if (!db) {
      return false;
    }

    return true;
  },
});

export const listAllLogs = query({
  args: {
    paginationOpts: paginationOptsValidator,
    fingerPrintId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("logs")
      .filter((q) => q.eq(q.field("fingerPrintId"), args.fingerPrintId))
      .order("desc")
      .paginate(args.paginationOpts);

    return logs;
  },
});

export const listAllLogsByTag = query({
  args: {
    fingerPrintId: v.string(),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("logs")
      .filter((q) => q.eq(q.field("fingerPrintId"), args.fingerPrintId))
      .order("desc")
      .collect();

    return logs.filter((post) => post.tags.includes(args.tag));
  },
});

export const createUserAccount = mutation({
  args: {
    fingerPrintId: v.string(),
  },
  handler: async (ctx, args) => {
    const db = await ctx.db.insert("users", {
      fingerPrintId: args.fingerPrintId,
    });

    if (!db) {
      return false;
    }

    return true;
  },
});

export const hasAccount = query({
  args: {
    fingerPrintId: v.string(),
  },
  handler: async (ctx, args) => {
    const db = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("fingerPrintId"), args.fingerPrintId))
      .first();

    return db;
  },
});
