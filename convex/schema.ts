import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  workspaces: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    image: v.optional(v.string()),
    inviteCode: v.string(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_invite_code", ["inviteCode"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_and_user", ["workspaceId", "userId"]),

  channels: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    isPrivate: v.boolean(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_name", ["workspaceId", "name"]),

  channelMembers: defineTable({
    channelId: v.id("channels"),
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
  })
    .index("by_channel", ["channelId"])
    .index("by_channel_and_user", ["channelId", "userId"])
    .index("by_workspace_and_user", ["workspaceId", "userId"]),

  channelMessages: defineTable({
    workspaceId: v.id("workspaces"),
    channelId: v.id("channels"),
    userId: v.optional(v.id("users")),
    type: v.union(v.literal("message"), v.literal("system")),
    body: v.string(),
    createdAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_channel_and_created_at", ["channelId", "createdAt"]),

  channelCanvases: defineTable({
    workspaceId: v.id("workspaces"),
    channelId: v.id("channels"),
    title: v.string(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_channel_and_updated_at", ["channelId", "updatedAt"]),

  channelCanvasDocs: defineTable({
    canvasId: v.id("channelCanvases"),
    blocks: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        text: v.string(),
      }),
    ),
    revision: v.number(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_canvas", ["canvasId"]),

  workspaceInvites: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    invitedBy: v.id("users"),
    token: v.string(),
    channelId: v.optional(v.id("channels")),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
    ),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_token", ["token"])
    .index("by_workspace_and_email", ["workspaceId", "email"]),

  handleSessions: defineTable({
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    type: v.union(v.literal("dm"), v.literal("channel")),
    channelId: v.optional(v.id("channels")),
    targetUserId: v.optional(v.id("users")),
    status: v.union(v.literal("active"), v.literal("ended")),
    title: v.string(),
    createdAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_status", ["workspaceId", "status"]),

  handleParticipants: defineTable({
    sessionId: v.id("handleSessions"),
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    micEnabled: v.boolean(),
    cameraEnabled: v.boolean(),
    screenSharing: v.boolean(),
    handRaised: v.boolean(),
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_user", ["sessionId", "userId"]),

  handleMessages: defineTable({
    sessionId: v.id("handleSessions"),
    userId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  handleReactions: defineTable({
    sessionId: v.id("handleSessions"),
    userId: v.id("users"),
    emoji: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  handleSignals: defineTable({
    sessionId: v.id("handleSessions"),
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    type: v.union(
      v.literal("offer"),
      v.literal("answer"),
      v.literal("ice"),
    ),
    payload: v.string(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_to", ["sessionId", "toUserId"]),
});

export default schema;
