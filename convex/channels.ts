import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  enrichUser,
  requireAdmin,
  requireAuthUserId,
  requireMembership,
} from "./lib/workspaceAuth";

const DEFAULT_CHANNELS = [
  {
    name: "all-testing",
    description:
      "Share announcements and updates about company news, upcoming events or teammates who deserve some kudos. ⭐",
  },
  {
    name: "new-channel",
    description: "This channel is for everything #new-channel. Hold meetings, share docs and make decisions together with your team.",
  },
  {
    name: "social",
    description:
      "Other channels are for work. This one's just for fun. Get to know your teammates and show your lighter side. 🎈",
  },
] as const;

export const seedDefaultChannels = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    await requireMembership(ctx, args.workspaceId, userId);

    const existing = await ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (existing) return;

    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const channel of DEFAULT_CHANNELS) {
      const channelId = await ctx.db.insert("channels", {
        workspaceId: args.workspaceId,
        name: channel.name,
        description: channel.description,
        createdBy: userId,
        isPrivate: false,
      });

      for (const member of members) {
        await ctx.db.insert("channelMembers", {
          channelId,
          userId: member.userId,
          workspaceId: args.workspaceId,
        });
      }
    }
  },
});

export const listChannels = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    await requireMembership(ctx, args.workspaceId, userId);

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const result = [];
    for (const channel of channels) {
      const members = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
        .collect();

      const isJoined = members.some((m) => m.userId === userId);

      result.push({
        _id: channel._id,
        name: channel.name,
        description: channel.description ?? null,
        isPrivate: channel.isPrivate,
        memberCount: members.length,
        isJoined,
      });
    }

    return result;
  },
});

export const listWorkspaceMembers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    await requireMembership(ctx, args.workspaceId, userId);

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const members = [];
    for (const membership of memberships) {
      const user = await enrichUser(ctx, membership.userId);
      if (!user) continue;
      members.push({
        ...user,
        role: membership.role,
        isSelf: membership.userId === userId,
      });
    }

    return members;
  },
});

export const createChannel = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    await requireAdmin(ctx, args.workspaceId, userId);

    const name = args.name.trim().replace(/^#/, "");
    if (!name) {
      throw new Error("Channel name is required");
    }

    const existing = await ctx.db
      .query("channels")
      .withIndex("by_workspace_and_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", name),
      )
      .unique();

    if (existing) {
      throw new Error("Channel already exists");
    }

    const channelId = await ctx.db.insert("channels", {
      workspaceId: args.workspaceId,
      name,
      description: args.description?.trim() || undefined,
      createdBy: userId,
      isPrivate: args.isPrivate ?? false,
    });

    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const member of members) {
      await ctx.db.insert("channelMembers", {
        channelId,
        userId: member.userId,
        workspaceId: args.workspaceId,
      });
    }

    return channelId;
  },
});

export const addMemberToChannel = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuthUserId(ctx);
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    await requireAdmin(ctx, channel.workspaceId, currentUserId);

    const existing = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_and_user", (q) =>
        q.eq("channelId", args.channelId).eq("userId", args.userId),
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("channelMembers", {
      channelId: args.channelId,
      userId: args.userId,
      workspaceId: channel.workspaceId,
    });
  },
});

export const getChannel = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const channel = await ctx.db.get(args.channelId);
    if (!channel) return null;

    await requireMembership(ctx, channel.workspaceId, userId);
    return {
      _id: channel._id,
      name: channel.name,
      description: channel.description ?? null,
      workspaceId: channel.workspaceId,
    };
  },
});

export const joinChannel = mutation({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    await requireMembership(ctx, channel.workspaceId, userId);

    const existing = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel_and_user", (q) =>
        q.eq("channelId", args.channelId).eq("userId", userId),
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("channelMembers", {
      channelId: args.channelId,
      userId,
      workspaceId: channel.workspaceId,
    });
  },
});
