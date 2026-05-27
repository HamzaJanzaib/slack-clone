import type { Id } from "../../../convex/_generated/dataModel";

export type ChannelTab = "messages" | "canvas";

export type CanvasBlock = {
    id: string;
    type: string;
    text: string;
};

export type ChannelMessage = {
    _id: Id<"channelMessages">;
    type: "message" | "system";
    body: string;
    createdAt: number;
    user: {
        _id: Id<"users">;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
};

export type ChannelCanvasSummary = {
    _id: Id<"channelCanvases">;
    title: string;
    updatedAt: number;
    createdBy: Id<"users">;
};
