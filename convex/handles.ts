import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  enrichUser,
  requireAuthUserId,
  requireMembership,
} from "./lib/workspaceAuth";

export const listActiveSessions = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    await requireMembership(ctx, args.workspaceId, userId);

    const sessions = await ctx.db
      .query("handleSessions")
      .withIndex("by_workspace_and_status", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("status", "active"),
      )
      .collect();

    return sessions.map((s) => ({
      _id: s._id,
      title: s.title,
      type: s.type,
      channelId: s.channelId ?? null,
      targetUserId: s.targetUserId ?? null,
      createdAt: s.createdAt,
    }));
  },
});

export const getSession = query({
  args: { sessionId: v.id("handleSessions") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    await requireMembership(ctx, session.workspaceId, userId);

    const participants = await ctx.db
      .query("handleParticipants")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const activeParticipants = participants.filter((p) => !p.leftAt);
    const enriched = await Promise.all(
      activeParticipants.map(async (p) => {
        const user = await enrichUser(ctx, p.userId);
        return {
          _id: p._id,
          userId: p.userId,
          user,
          micEnabled: p.micEnabled,
          cameraEnabled: p.cameraEnabled,
          screenSharing: p.screenSharing,
          handRaised: p.handRaised,
          joinedAt: p.joinedAt,
        };
      }),
    );

    const messages = await ctx.db
      .query("handleMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const enrichedMessages = await Promise.all(
      messages.map(async (m) => {
        const user = await enrichUser(ctx, m.userId);
        return {
          _id: m._id,
          body: m.body,
          createdAt: m.createdAt,
          user,
        };
      }),
    );

    const reactions = await ctx.db
      .query("handleReactions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return {
      ...session,
      participants: enriched.filter((p) => p.user !== null),
      messages: enrichedMessages.sort((a, b) => a.createdAt - b.createdAt),
      reactions: reactions.slice(-20),
    };
  },
});

export const createSession = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.union(v.literal("dm"), v.literal("channel")),
    channelId: v.optional(v.id("channels")),
    targetUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    await requireMembership(ctx, args.workspaceId, userId);

    let title = "Huddle";
    if (args.type === "channel" && args.channelId) {
      const channel = await ctx.db.get(args.channelId);
      if (!channel) throw new Error("Channel not found");
      title = `#${channel.name}`;
    } else if (args.type === "dm" && args.targetUserId) {
      const target = await enrichUser(ctx, args.targetUserId);
      title = target?.name ?? target?.email?.split("@")[0] ?? "Huddle";
    }

    const sessionId = await ctx.db.insert("handleSessions", {
      workspaceId: args.workspaceId,
      createdBy: userId,
      type: args.type,
      channelId: args.channelId,
      targetUserId: args.targetUserId,
      status: "active",
      title,
      createdAt: Date.now(),
    });

    await ctx.db.insert("handleParticipants", {
      sessionId,
      userId,
      workspaceId: args.workspaceId,
      micEnabled: true,
      cameraEnabled: false,
      screenSharing: false,
      handRaised: false,
      joinedAt: Date.now(),
    });

    if (args.targetUserId && args.targetUserId !== userId) {
      const existing = await ctx.db
        .query("handleParticipants")
        .withIndex("by_session_and_user", (q) =>
          q.eq("sessionId", sessionId).eq("userId", args.targetUserId!),
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("handleParticipants", {
          sessionId,
          userId: args.targetUserId,
          workspaceId: args.workspaceId,
          micEnabled: false,
          cameraEnabled: false,
          screenSharing: false,
          handRaised: false,
          joinedAt: Date.now(),
        });
      }
    }

    return sessionId;
  },
});

export const joinSession = mutation({
  args: { sessionId: v.id("handleSessions") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "active") {
      throw new Error("Session not found or ended");
    }

    await requireMembership(ctx, session.workspaceId, userId);

    const existing = await ctx.db
      .query("handleParticipants")
      .withIndex("by_session_and_user", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", userId),
      )
      .unique();

    if (existing) {
      if (existing.leftAt) {
        await ctx.db.patch(existing._id, {
          leftAt: undefined,
          joinedAt: Date.now(),
          micEnabled: true,
          cameraEnabled: false,
          screenSharing: false,
          handRaised: false,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("handleParticipants", {
      sessionId: args.sessionId,
      userId,
      workspaceId: session.workspaceId,
      micEnabled: true,
      cameraEnabled: false,
      screenSharing: false,
      handRaised: false,
      joinedAt: Date.now(),
    });
  },
});

export const leaveSession = mutation({
  args: { sessionId: v.id("handleSessions") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) return;

    const participant = await ctx.db
      .query("handleParticipants")
      .withIndex("by_session_and_user", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", userId),
      )
      .unique();

    if (participant && !participant.leftAt) {
      await ctx.db.patch(participant._id, { leftAt: Date.now() });
    }

    const remaining = await ctx.db
      .query("handleParticipants")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const activeCount = remaining.filter((p) => !p.leftAt).length;
    if (activeCount === 0) {
      await ctx.db.patch(args.sessionId, {
        status: "ended",
        endedAt: Date.now(),
      });
    }
  },
});

export const updateParticipantState = mutation({
  args: {
    sessionId: v.id("handleSessions"),
    micEnabled: v.optional(v.boolean()),
    cameraEnabled: v.optional(v.boolean()),
    screenSharing: v.optional(v.boolean()),
    handRaised: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const participant = await ctx.db
      .query("handleParticipants")
      .withIndex("by_session_and_user", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", userId),
      )
      .unique();

    if (!participant || participant.leftAt) {
      throw new Error("Not in session");
    }

    await ctx.db.patch(participant._id, {
      ...(args.micEnabled !== undefined && { micEnabled: args.micEnabled }),
      ...(args.cameraEnabled !== undefined && {
        cameraEnabled: args.cameraEnabled,
      }),
      ...(args.screenSharing !== undefined && {
        screenSharing: args.screenSharing,
      }),
      ...(args.handRaised !== undefined && { handRaised: args.handRaised }),
    });
  },
});

export const sendMessage = mutation({
  args: {
    sessionId: v.id("handleSessions"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const trimmed = args.body.trim();
    if (!trimmed) return;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "active") {
      throw new Error("Session not active");
    }

    await requireMembership(ctx, session.workspaceId, userId);

    await ctx.db.insert("handleMessages", {
      sessionId: args.sessionId,
      userId,
      body: trimmed,
      createdAt: Date.now(),
    });
  },
});

export const addReaction = mutation({
  args: {
    sessionId: v.id("handleSessions"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "active") {
      throw new Error("Session not active");
    }

    await requireMembership(ctx, session.workspaceId, userId);

    await ctx.db.insert("handleReactions", {
      sessionId: args.sessionId,
      userId,
      emoji: args.emoji,
      createdAt: Date.now(),
    });
  },
});

export const sendSignal = mutation({
  args: {
    sessionId: v.id("handleSessions"),
    toUserId: v.id("users"),
    type: v.union(
      v.literal("offer"),
      v.literal("answer"),
      v.literal("ice"),
    ),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "active") {
      throw new Error("Session not active");
    }

    await requireMembership(ctx, session.workspaceId, userId);

    await ctx.db.insert("handleSignals", {
      sessionId: args.sessionId,
      fromUserId: userId,
      toUserId: args.toUserId,
      type: args.type,
      payload: args.payload,
      createdAt: Date.now(),
    });
  },
});

export const getSignalsForUser = query({
  args: {
    sessionId: v.id("handleSessions"),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session) return [];

    await requireMembership(ctx, session.workspaceId, userId);

    const signals = await ctx.db
      .query("handleSignals")
      .withIndex("by_session_and_to", (q) =>
        q.eq("sessionId", args.sessionId).eq("toUserId", userId),
      )
      .collect();

    const since = args.since ?? 0;
    return signals
      .filter((s) => s.createdAt > since)
      .map((s) => ({
        _id: s._id,
        fromUserId: s.fromUserId,
        type: s.type,
        payload: s.payload,
        createdAt: s.createdAt,
      }));
  },
});
