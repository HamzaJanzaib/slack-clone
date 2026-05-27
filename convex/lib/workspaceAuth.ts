import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";

export async function requireAuthUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

export async function getMembership(
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

export async function requireMembership(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) {
  const membership = await getMembership(ctx, workspaceId, userId);
  if (!membership) {
    throw new Error("Not a member of this workspace");
  }
  return membership;
}

export async function requireAdmin(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) {
  const membership = await requireMembership(ctx, workspaceId, userId);
  if (membership.role !== "admin") {
    throw new Error("Not authorized");
  }
  return membership;
}

export async function enrichUser(ctx: QueryCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
  };
}
