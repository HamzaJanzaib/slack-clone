import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { enrichUser, requireAuthUserId, requireMembership } from "./lib/workspaceAuth";

export const listMessages = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const channel = await ctx.db.get(args.channelId);
    if (!channel) return [];
    await requireMembership(ctx, channel.workspaceId, userId);

    const messages = await ctx.db
      .query("channelMessages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    const enriched = await Promise.all(
      messages.map(async (message) => {
        const user = message.userId ? await enrichUser(ctx, message.userId) : null;
        return {
          ...message,
          user,
        };
      }),
    );

    return enriched.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");
    await requireMembership(ctx, channel.workspaceId, userId);

    const body = args.body.trim();
    if (!body) return null;

    return await ctx.db.insert("channelMessages", {
      workspaceId: channel.workspaceId,
      channelId: args.channelId,
      userId,
      type: "message",
      body,
      createdAt: Date.now(),
    });
  },
});

export const postSystemMessage = mutation({
  args: {
    channelId: v.id("channels"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");
    await requireMembership(ctx, channel.workspaceId, userId);

    return await ctx.db.insert("channelMessages", {
      workspaceId: channel.workspaceId,
      channelId: args.channelId,
      type: "system",
      body: args.body.trim(),
      createdAt: Date.now(),
    });
  },
});
