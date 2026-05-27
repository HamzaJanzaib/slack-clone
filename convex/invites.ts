import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import {
  requireAuthUserId,
  requireMembership,
} from "./lib/workspaceAuth";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 24; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export const listInvites = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    await requireMembership(ctx, args.workspaceId, userId);

    const invites = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return invites.map((invite) => ({
      _id: invite._id,
      email: invite.email,
      status: invite.status,
      createdAt: invite.createdAt,
      channelId: invite.channelId ?? null,
    }));
  },
});

export const createEmailInvite = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    channelId: v.optional(v.id("channels")),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    await requireMembership(ctx, args.workspaceId, userId);

    const email = args.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      throw new Error("Valid email is required");
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const token = generateToken();
    const inviteId = await ctx.db.insert("workspaceInvites", {
      workspaceId: args.workspaceId,
      email,
      invitedBy: userId,
      token,
      channelId: args.channelId,
      status: "pending",
      createdAt: Date.now(),
    });

    return { inviteId, token, workspaceName: workspace.name };
  },
});

export const acceptInviteByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);

    const invite = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invite || invite.status !== "pending") {
      throw new Error("Invalid or expired invite");
    }

    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) =>
        q.eq("workspaceId", invite.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("workspaceMembers", {
        workspaceId: invite.workspaceId,
        userId,
        role: "member",
      });
    }

    if (invite.channelId) {
      const channelMember = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel_and_user", (q) =>
          q.eq("channelId", invite.channelId!).eq("userId", userId),
        )
        .unique();

      if (!channelMember) {
        await ctx.db.insert("channelMembers", {
          channelId: invite.channelId,
          userId,
          workspaceId: invite.workspaceId,
        });
      }
    }

    await ctx.db.patch(invite._id, { status: "accepted" });
    return invite.workspaceId;
  },
});

export const inviteByEmail = action({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    channelId: v.optional(v.id("channels")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.currentUser);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const result: {
      inviteId: import("./_generated/dataModel").Id<"workspaceInvites">;
      token: string;
      workspaceName: string;
    } = await ctx.runMutation(api.invites.createEmailInvite, {
      workspaceId: args.workspaceId,
      email: args.email,
      channelId: args.channelId,
    });

    let channelName: string | undefined;
    if (args.channelId) {
      const channel = await ctx.runQuery(api.channels.getChannel, {
        channelId: args.channelId,
      });
      channelName = channel?.name;
    }

    await ctx.runAction(api.email.sendWorkspaceInviteEmail, {
      to: args.email.trim().toLowerCase(),
      workspaceName: result.workspaceName,
      inviteToken: result.token,
      inviterName: user.name ?? user.email ?? undefined,
      channelName,
    });

    return result.inviteId;
  },
});
