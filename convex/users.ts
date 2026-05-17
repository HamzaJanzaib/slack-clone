import { getAuthUserId, retrieveAccount, modifyAccountCredentials } from "@convex-dev/auth/server";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
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

export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.currentUser);
    if (!user || !user.email) {
      throw new Error("User email not found");
    }

    try {
      await retrieveAccount(ctx, {
        provider: "password",
        account: {
          id: user.email,
          secret: args.currentPassword,
        },
      });
    } catch (error) {
      throw new Error("Incorrect current password");
    }

    if (args.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long");
    }

    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: {
        id: user.email,
        secret: args.newPassword,
      },
    });
  },
});
