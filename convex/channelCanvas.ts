import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { requireAuthUserId, requireMembership } from "./lib/workspaceAuth";

function blockId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultBlocks() {
  return [
    { id: blockId(), type: "heading", text: "Your canvas title" },
    { id: blockId(), type: "paragraph", text: "Words go here" },
  ];
}

const TEMPLATE_BLOCKS: Record<string, Array<{ type: string; text: string }>> = {
  overview: [
    { type: "heading", text: "Channel overview" },
    { type: "paragraph", text: "Purpose of this channel" },
    { type: "bullet", text: "Key updates" },
    { type: "bullet", text: "Owners and stakeholders" },
  ],
  weekly: [
    { type: "heading", text: "Weekly sync" },
    { type: "paragraph", text: "Agenda" },
    { type: "bullet", text: "Topic 1" },
    { type: "bullet", text: "Topic 2" },
    { type: "paragraph", text: "Decisions" },
  ],
  resources: [
    { type: "heading", text: "Shared resources" },
    { type: "bullet", text: "Important links" },
    { type: "bullet", text: "Docs and files" },
  ],
};

function blocksFromTemplate(templateKey: string) {
  const template = TEMPLATE_BLOCKS[templateKey] ?? TEMPLATE_BLOCKS.overview;
  return template.map((block) => ({ id: blockId(), ...block }));
}

export const listCanvases = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const channel = await ctx.db.get(args.channelId);
    if (!channel) return [];
    await requireMembership(ctx, channel.workspaceId, userId);

    const canvases = await ctx.db
      .query("channelCanvases")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    return canvases.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getCanvas = query({
  args: { canvasId: v.id("channelCanvases") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) return null;
    await requireMembership(ctx, canvas.workspaceId, userId);
    const doc = await ctx.db
      .query("channelCanvasDocs")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .unique();

    return { ...canvas, doc };
  },
});

export const createCanvas = mutation({
  args: {
    channelId: v.id("channels"),
    title: v.optional(v.string()),
    templateKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");
    await requireMembership(ctx, channel.workspaceId, userId);

    const now = Date.now();
    const canvasId = await ctx.db.insert("channelCanvases", {
      workspaceId: channel.workspaceId,
      channelId: args.channelId,
      title: args.title?.trim() || "Untitled",
      createdBy: userId,
      updatedAt: now,
    });

    const blocks = args.templateKey
      ? blocksFromTemplate(args.templateKey)
      : defaultBlocks();

    await ctx.db.insert("channelCanvasDocs", {
      canvasId,
      blocks,
      revision: 1,
      updatedBy: userId,
      updatedAt: now,
    });

    await ctx.runMutation(api.channelChat.postSystemMessage, {
      channelId: args.channelId,
      body: `created canvas "${args.title?.trim() || "Untitled"}"`,
    });

    return canvasId;
  },
});

export const duplicateCanvas = mutation({
  args: {
    sourceCanvasId: v.id("channelCanvases"),
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");
    await requireMembership(ctx, channel.workspaceId, userId);

    const source = await ctx.db.get(args.sourceCanvasId);
    if (!source) throw new Error("Source canvas not found");

    const sourceDoc = await ctx.db
      .query("channelCanvasDocs")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.sourceCanvasId))
      .unique();

    const now = Date.now();
    const canvasId = await ctx.db.insert("channelCanvases", {
      workspaceId: channel.workspaceId,
      channelId: args.channelId,
      title: `${source.title} (copy)`,
      createdBy: userId,
      updatedAt: now,
    });

    const blocks =
      sourceDoc?.blocks.map((block) => ({
        ...block,
        id: blockId(),
      })) ?? defaultBlocks();

    await ctx.db.insert("channelCanvasDocs", {
      canvasId,
      blocks,
      revision: 1,
      updatedBy: userId,
      updatedAt: now,
    });

    await ctx.runMutation(api.channelChat.postSystemMessage, {
      channelId: args.channelId,
      body: `added canvas "${source.title}"`,
    });

    return canvasId;
  },
});

export const renameCanvas = mutation({
  args: {
    canvasId: v.id("channelCanvases"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) throw new Error("Canvas not found");
    await requireMembership(ctx, canvas.workspaceId, userId);
    const title = args.title.trim();
    if (!title) throw new Error("Title is required");
    await ctx.db.patch(args.canvasId, {
      title,
      updatedAt: Date.now(),
    });
    await ctx.runMutation(api.channelChat.postSystemMessage, {
      channelId: canvas.channelId,
      body: `renamed canvas to "${title}"`,
    });
  },
});

export const updateCanvasDoc = mutation({
  args: {
    canvasId: v.id("channelCanvases"),
    blocks: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        text: v.string(),
      }),
    ),
    revision: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas) throw new Error("Canvas not found");
    await requireMembership(ctx, canvas.workspaceId, userId);

    const doc = await ctx.db
      .query("channelCanvasDocs")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .unique();

    const now = Date.now();
    if (!doc) {
      await ctx.db.insert("channelCanvasDocs", {
        canvasId: args.canvasId,
        blocks: args.blocks,
        revision: args.revision,
        updatedBy: userId,
        updatedAt: now,
      });
    } else {
      if (args.revision < doc.revision) return;
      await ctx.db.patch(doc._id, {
        blocks: args.blocks,
        revision: args.revision,
        updatedBy: userId,
        updatedAt: now,
      });
    }
    await ctx.db.patch(args.canvasId, { updatedAt: now });
  },
});
