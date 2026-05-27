import type { Id } from "../../../convex/_generated/dataModel";

export type HandleTargetType = "dm" | "channel";

export type HandleTarget =
    | { type: "dm"; userId: Id<"users">; label: string }
    | { type: "channel"; channelId: Id<"channels">; label: string };

export type DirectoryTab = "people" | "channels";

export type HandleSidePanel = "thread" | "canvas" | null;

export type MemberSort = "recommended" | "name" | "recent";
export type ChannelSort = "recommended" | "name" | "members";

export type WorkspaceMember = {
    _id: Id<"users">;
    name: string | null;
    email: string | null;
    image: string | null;
    role: "admin" | "member";
    isSelf: boolean;
};

export type WorkspaceChannel = {
    _id: Id<"channels">;
    name: string;
    description: string | null;
    isPrivate: boolean;
    memberCount: number;
    isJoined: boolean;
};
