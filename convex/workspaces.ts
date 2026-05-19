import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

function generateInviteCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function getMembership(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();
}

async function requireAdmin(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) {
  const membership = await getMembership(ctx, workspaceId, userId);
  if (!membership || membership.role !== "admin") {
    throw new Error("Not authorized");
  }
  return membership;
}

export const getWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const workspaces = [];

    for (const membership of memberships) {
      const workspace = await ctx.db.get(membership.workspaceId);
      if (!workspace) continue;

      const allMembers = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) =>
          q.eq("workspaceId", workspace._id),
        )
        .collect();

      const memberPreview = (
        await Promise.all(
          allMembers.slice(0, 4).map(async (member) => {
            const user = await ctx.db.get(member.userId);
            if (!user) return null;
            return {
              _id: user._id,
              name: user.name ?? null,
              image: user.image ?? null,
            };
          }),
        )
      ).filter(
        (member): member is NonNullable<typeof member> => member !== null,
      );

      workspaces.push({
        ...workspace,
        memberCount: allMembers.length,
        memberPreview,
        role: membership.role,
      });
    }

    return workspaces;
  },
});

export const getWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const membership = await getMembership(ctx, args.workspaceId, userId);
    if (!membership) {
      return null;
    }

    return await ctx.db.get(args.workspaceId);
  },
});

export const getWorkspaceByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!workspace) {
      return null;
    }

    return { _id: workspace._id, name: workspace.name };
  },
});

export const createWorkspace = mutation({
  args: {
    name: v.string(),
    image: v.optional(v.string()),
    storageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let imageUrl = args.image;
    if (args.storageId) {
      imageUrl = (await ctx.storage.getUrl(args.storageId)) ?? undefined;
    }

    let inviteCode = generateInviteCode();
    let existing = await ctx.db
      .query("workspaces")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
      .unique();
    while (existing) {
      inviteCode = generateInviteCode();
      existing = await ctx.db
        .query("workspaces")
        .withIndex("by_invite_code", (q) => q.eq("inviteCode", inviteCode))
        .unique();
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      image: imageUrl,
      ownerId: userId,
      inviteCode,
    });

    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId,
      role: "admin",
    });

    return workspaceId;
  },
});

export const updateWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Workspace name is required");
    }

    await requireAdmin(ctx, args.workspaceId, userId);
    await ctx.db.patch(args.workspaceId, { name: trimmedName });
  },
});

export const joinWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await getMembership(ctx, args.workspaceId, userId);
    if (existing) {
      return args.workspaceId;
    }

    await ctx.db.insert("workspaceMembers", {
      workspaceId: args.workspaceId,
      userId,
      role: "member",
    });

    return args.workspaceId;
  },
});

export const joinWorkspaceByInviteCode = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!workspace) {
      throw new Error("Invalid invite code");
    }

    const existing = await getMembership(ctx, workspace._id, userId);
    if (existing) {
      return workspace._id;
    }

    await ctx.db.insert("workspaceMembers", {
      workspaceId: workspace._id,
      userId,
      role: "member",
    });

    return workspace._id;
  },
});

export const leaveWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const membership = await getMembership(ctx, args.workspaceId, userId);
    if (!membership) {
      throw new Error("Not a member of this workspace");
    }

    await ctx.db.delete(membership._id);
  },
});

export const deleteWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await requireAdmin(ctx, args.workspaceId, userId);

    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    await ctx.db.delete(args.workspaceId);
  },
});
