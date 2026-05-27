"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
    Building2,
    Hash,
    Mail,
    Search,
    SlidersHorizontal,
    User,
    Users,
    X,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChannelSort, DirectoryTab, MemberSort } from "../types";
import { DirectoriesPeopleTab } from "./directories-people-tab";
import { DirectoriesChannelsTab } from "./directories-channels-tab";
import { CreateChannelModal } from "./create-channel-modal";
import { InvitePeopleModal } from "./invite-people-modal";
import { cn } from "@/lib/utils";

export function DirectoriesView({
    workspaceId,
    isAdmin,
}: {
    workspaceId: Id<"workspaces">;
    isAdmin: boolean;
}) {
    const [tab, setTab] = useState<DirectoryTab>("people");
    const [search, setSearch] = useState("");
    const [memberSort, setMemberSort] = useState<MemberSort>("recommended");
    const [channelSort, setChannelSort] = useState<ChannelSort>("recommended");
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);

    const members = useQuery(api.channels.listWorkspaceMembers, { workspaceId });
    const channels = useQuery(api.channels.listChannels, { workspaceId });

    const filteredMembers = useMemo(() => {
        if (!members) return [];
        let list = [...members];
        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter(
                (m) =>
                    m.name?.toLowerCase().includes(q) ||
                    m.email?.toLowerCase().includes(q),
            );
        }
        if (memberSort === "name") {
            list.sort((a, b) =>
                (a.name ?? a.email ?? "").localeCompare(b.name ?? b.email ?? ""),
            );
        }
        return list;
    }, [members, memberSort, search]);

    const filteredChannels = useMemo(() => {
        if (!channels) return [];
        let list = [...channels];
        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter((c) => c.name.toLowerCase().includes(q));
        }
        if (channelSort === "name") {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (channelSort === "members") {
            list.sort((a, b) => b.memberCount - a.memberCount);
        }
        return list;
    }, [channelSort, channels, search]);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background px-6 py-8 text-foreground md:px-10">
            <h1 className="mb-6 text-[28px] font-bold tracking-tight">
                Directories
            </h1>

            <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as DirectoryTab)}
                className="flex flex-col gap-6"
            >
                <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
                    <TabsTrigger
                        value="people"
                        className={cn(
                            "cursor-pointer rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-2 shadow-none",
                            "data-[state=active]:border-foreground data-[state=active]:bg-transparent",
                        )}
                    >
                        <User className="mr-2 size-4" />
                        People
                    </TabsTrigger>
                    <TabsTrigger
                        value="channels"
                        className={cn(
                            "cursor-pointer rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-2 shadow-none",
                            "data-[state=active]:border-foreground data-[state=active]:bg-transparent",
                        )}
                    >
                        <Hash className="mr-2 size-4" />
                        Channels
                    </TabsTrigger>
                    <TabsTrigger
                        value="people"
                        disabled
                        className="pointer-events-none opacity-40"
                    >
                        <Users className="mr-2 size-4" />
                        User groups
                    </TabsTrigger>
                    <TabsTrigger
                        value="people"
                        disabled
                        className="pointer-events-none opacity-40"
                    >
                        <Building2 className="mr-2 size-4" />
                        External
                    </TabsTrigger>
                    <TabsTrigger
                        value="people"
                        disabled
                        className="pointer-events-none opacity-40"
                    >
                        <Mail className="mr-2 size-4" />
                        Invitations
                    </TabsTrigger>
                </TabsList>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[200px] flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={
                                tab === "people"
                                    ? "Search for people"
                                    : "Search for channels"
                            }
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 pl-9"
                        />
                    </div>
                    {tab === "people" ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setInviteOpen(true)}
                        >
                            Invite people
                        </Button>
                    ) : isAdmin ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setCreateChannelOpen(true)}
                        >
                            Create channel
                        </Button>
                    ) : null}
                </div>

                {!bannerDismissed && tab === "people" && (
                    <div className="relative rounded-xl bg-[#1a2b4a] p-6 text-white">
                        <button
                            type="button"
                            aria-label="Dismiss"
                            className="absolute top-4 right-4 cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => setBannerDismissed(true)}
                        >
                            <X className="size-4" />
                        </button>
                        <h2 className="text-lg font-bold">
                            Invite your team to Slack
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-white/80">
                            Bring your team members into Slack to start working
                            better together. Send invitations via email or get a
                            handy link to share.
                        </p>
                        <Button
                            type="button"
                            className="mt-4 cursor-pointer"
                            onClick={() => setInviteOpen(true)}
                        >
                            Invite people
                        </Button>
                    </div>
                )}

                {!bannerDismissed && tab === "channels" && (
                    <div className="relative rounded-xl bg-[#1a2b4a] p-6 text-white">
                        <button
                            type="button"
                            aria-label="Dismiss"
                            className="absolute top-4 right-4 cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => setBannerDismissed(true)}
                        >
                            <X className="size-4" />
                        </button>
                        <h2 className="text-lg font-bold">
                            Organise your team&apos;s conversations
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-white/80">
                            Channels are spaces for gathering all the right
                            people, messages, files and tools.
                        </p>
                        {isAdmin && (
                            <Button
                                type="button"
                                className="mt-4 cursor-pointer"
                                onClick={() => setCreateChannelOpen(true)}
                            >
                                Create a channel
                            </Button>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-muted-foreground"
                    >
                        <SlidersHorizontal className="mr-1 size-4" />
                        Filters
                    </Button>
                    <div className="ml-auto">
                        <Select
                            value={tab === "people" ? memberSort : channelSort}
                            onValueChange={(v) => {
                                if (tab === "people") {
                                    setMemberSort(v as MemberSort);
                                } else {
                                    setChannelSort(v as ChannelSort);
                                }
                            }}
                        >
                            <SelectTrigger className="h-9 w-[180px] cursor-pointer">
                                <SelectValue placeholder="Most recommended" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recommended">
                                    Most recommended
                                </SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                {tab === "channels" && (
                                    <SelectItem value="members">
                                        Member count
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <TabsContent value="people" className="mt-0">
                    <DirectoriesPeopleTab members={filteredMembers} />
                </TabsContent>
                <TabsContent value="channels" className="mt-0">
                    <DirectoriesChannelsTab
                        channels={filteredChannels}
                        isAdmin={isAdmin}
                    />
                </TabsContent>
            </Tabs>

            <CreateChannelModal
                open={createChannelOpen}
                onOpenChange={setCreateChannelOpen}
                workspaceId={workspaceId}
            />
            <InvitePeopleModal
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                workspaceId={workspaceId}
            />
        </div>
    );
}
