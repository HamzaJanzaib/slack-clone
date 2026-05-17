import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    storageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    let imageUrl = args.image;
    if (args.storageId) {
      imageUrl = await ctx.storage.getUrl(args.storageId) ?? undefined;
    }
    await ctx.db.patch(userId, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.phone !== undefined && { phone: args.phone }),
      ...(imageUrl !== undefined && { image: imageUrl }),
    });
  },
});
