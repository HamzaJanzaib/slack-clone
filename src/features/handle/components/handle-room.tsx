"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
    FileText,
    Hand,
    Headphones,
    MessageSquare,
    Mic,
    MicOff,
    Monitor,
    MoreVertical,
    PhoneOff,
    Smile,
    Sparkles,
    Video,
    VideoOff,
    X,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useHandleStore } from "../store/use-handle-store";
import { useWebRtc } from "../hooks/use-webrtc";
import { HandleThreadPanel } from "./handle-thread-panel";
import { HandleCanvasPanel } from "./handle-canvas-panel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const EMOJI_OPTIONS = ["👍", "👏", "😂", "🎉", "❤️", "🔥"];

export function HandleRoom({
    sessionId,
}: {
    sessionId: Id<"handleSessions">;
    workspaceId: Id<"workspaces">;
}) {
    const { sidePanel, setSidePanel, setActiveSessionId } = useHandleStore();
    const session = useQuery(api.handles.getSession, { sessionId });
    const currentUser = useQuery(api.users.currentUser);
    const updateState = useMutation(api.handles.updateParticipantState);
    const leaveSession = useMutation(api.handles.leaveSession);
    const addReaction = useMutation(api.handles.addReaction);
    const joinSession = useMutation(api.handles.joinSession);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(false);
    const [screenSharing, setScreenSharing] = useState(false);
    const [handRaised, setHandRaised] = useState(false);

    const selfParticipant = session?.participants.find(
        (p) => p.userId === currentUser?._id,
    );

    const remoteUserIds =
        session?.participants
            .filter((p) => p.userId !== currentUser?._id)
            .map((p) => p.userId) ?? [];

    const { localStream, remoteStreams, toggleMic, toggleCamera } = useWebRtc({
        sessionId,
        localUserId: currentUser?._id ?? null,
        remoteUserIds,
        enabled: !!session && session.status === "active",
    });

    useEffect(() => {
        void joinSession({ sessionId });
    }, [joinSession, sessionId]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, cameraOn]);

    useEffect(() => {
        if (selfParticipant) {
            setMicOn(selfParticipant.micEnabled);
            setCameraOn(selfParticipant.cameraEnabled);
            setScreenSharing(selfParticipant.screenSharing);
            setHandRaised(selfParticipant.handRaised);
        }
    }, [selfParticipant]);

    const handleLeave = async () => {
        try {
            await leaveSession({ sessionId });
            setActiveSessionId(null);
            setSidePanel(null);
            localStream?.getTracks().forEach((t) => t.stop());
        } catch {
            toast.error("Failed to leave huddle");
        }
    };

    const syncState = async (patch: {
        micEnabled?: boolean;
        cameraEnabled?: boolean;
        screenSharing?: boolean;
        handRaised?: boolean;
    }) => {
        await updateState({ sessionId, ...patch });
    };

    const title =
        session?.type === "dm"
            ? `Huddle with ${session.targetUserId ? session.title : "someone"}`
            : session?.title ?? "Huddle";

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1025] text-white">
            <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3">
                <Headphones className="size-4 opacity-80" />
                <h1 className="text-sm font-semibold">{title}</h1>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 cursor-pointer gap-1 text-white/80 hover:bg-white/10 hover:text-white"
                >
                    <Sparkles className="size-3.5" />
                    AI notes: Off
                </Button>
            </header>

            <div className="flex min-h-0 flex-1">
                <main
                    className={cn(
                        "relative flex min-w-0 flex-1 flex-col bg-gradient-to-br from-violet-200/40 via-purple-100/30 to-blue-200/40",
                        sidePanel && "md:mr-0",
                    )}
                >
                    <div className="flex flex-1 flex-wrap items-center justify-center gap-6 p-6">
                        {session?.participants.map((p) => {
                            const name =
                                p.user?.name ??
                                p.user?.email?.split("@")[0] ??
                                "Guest";
                            const initial = name[0]?.toUpperCase() ?? "?";
                            const isSelf = p.userId === currentUser?._id;
                            const remoteStream = remoteStreams.get(p.userId);

                            return (
                                <div
                                    key={p._id}
                                    className="relative flex size-48 flex-col overflow-hidden rounded-2xl shadow-lg sm:size-56 md:size-64"
                                >
                                    {isSelf && cameraOn && localStream ? (
                                        <video
                                            ref={localVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="size-full object-cover"
                                        />
                                    ) : remoteStream &&
                                      !isSelf &&
                                      remoteStream.getTracks().length > 0 ? (
                                        <ParticipantVideo
                                            stream={remoteStream}
                                        />
                                    ) : (
                                        <div
                                            className={cn(
                                                "flex size-full items-center justify-center",
                                                isSelf
                                                    ? "bg-teal-600"
                                                    : "bg-muted",
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "text-6xl font-bold",
                                                    isSelf
                                                        ? "text-white"
                                                        : "text-muted-foreground",
                                                )}
                                            >
                                                {initial}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <span className="rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium">
                                            {name}
                                        </span>
                                        {!p.micEnabled && (
                                            <MicOff className="size-3.5 text-red-400" />
                                        )}
                                        {p.handRaised && (
                                            <Hand className="size-3.5 text-yellow-400" />
                                        )}
                                    </div>
                                    {!isSelf && (
                                        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-black">
                                            Invited
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {session?.reactions && session.reactions.length > 0 && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <span className="animate-bounce text-4xl">
                                {session.reactions[session.reactions.length - 1]
                                    ?.emoji}
                            </span>
                        </div>
                    )}

                    <HandleControlBar
                        micOn={micOn}
                        cameraOn={cameraOn}
                        screenSharing={screenSharing}
                        handRaised={handRaised}
                        sidePanel={sidePanel}
                        onToggleMic={async () => {
                            const next = !micOn;
                            setMicOn(next);
                            toggleMic(next);
                            await syncState({ micEnabled: next });
                        }}
                        onToggleCamera={async () => {
                            const next = !cameraOn;
                            setCameraOn(next);
                            await toggleCamera(next);
                            await syncState({ cameraEnabled: next });
                        }}
                        onToggleScreen={async () => {
                            const next = !screenSharing;
                            if (next && navigator.mediaDevices?.getDisplayMedia) {
                                try {
                                    await navigator.mediaDevices.getDisplayMedia({
                                        video: true,
                                    });
                                } catch {
                                    toast.error("Screen share cancelled");
                                    return;
                                }
                            }
                            setScreenSharing(next);
                            await syncState({ screenSharing: next });
                        }}
                        onToggleHand={async () => {
                            const next = !handRaised;
                            setHandRaised(next);
                            await syncState({ handRaised: next });
                        }}
                        onReaction={async (emoji) => {
                            await addReaction({ sessionId, emoji });
                        }}
                        onToggleThread={() =>
                            setSidePanel(
                                sidePanel === "thread" ? null : "thread",
                            )
                        }
                        onToggleCanvas={() =>
                            setSidePanel(
                                sidePanel === "canvas" ? null : "canvas",
                            )
                        }
                        onLeave={() => void handleLeave()}
                    />
                </main>

                {sidePanel === "thread" && (
                    <HandleThreadPanel
                        sessionId={sessionId}
                        onClose={() => setSidePanel(null)}
                    />
                )}
                {sidePanel === "canvas" && (
                    <HandleCanvasPanel onClose={() => setSidePanel(null)} />
                )}
            </div>
        </div>
    );
}

function ParticipantVideo({ stream }: { stream: MediaStream }) {
    const ref = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream;
    }, [stream]);
    return (
        <video
            ref={ref}
            autoPlay
            playsInline
            className="size-full object-cover"
        />
    );
}

function HandleControlBar({
    micOn,
    cameraOn,
    screenSharing,
    handRaised,
    sidePanel,
    onToggleMic,
    onToggleCamera,
    onToggleScreen,
    onToggleHand,
    onReaction,
    onToggleThread,
    onToggleCanvas,
    onLeave,
}: {
    micOn: boolean;
    cameraOn: boolean;
    screenSharing: boolean;
    handRaised: boolean;
    sidePanel: "thread" | "canvas" | null;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onToggleScreen: () => void;
    onToggleHand: () => void;
    onReaction: (emoji: string) => void;
    onToggleThread: () => void;
    onToggleCanvas: () => void;
    onLeave: () => void;
}) {
    const [emojiOpen, setEmojiOpen] = useState(false);

    return (
        <div className="flex shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-[#1a1025]/95 px-4 py-3">
            <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1">
                <ControlButton
                    active={micOn}
                    onClick={onToggleMic}
                    icon={micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
                    label="Microphone"
                />
                <ControlButton
                    active={cameraOn}
                    onClick={onToggleCamera}
                    icon={
                        cameraOn ? (
                            <Video className="size-5" />
                        ) : (
                            <VideoOff className="size-5" />
                        )
                    }
                    label="Camera"
                />
                <ControlButton
                    active={screenSharing}
                    onClick={onToggleScreen}
                    icon={<Monitor className="size-5" />}
                    label="Share screen"
                />
                <ControlButton
                    active={handRaised}
                    onClick={onToggleHand}
                    icon={<Hand className="size-5" />}
                    label="Raise hand"
                />
                <div className="relative">
                    <ControlButton
                        active={emojiOpen}
                        onClick={() => setEmojiOpen((o) => !o)}
                        icon={<Smile className="size-5" />}
                        label="React"
                    />
                    {emojiOpen && (
                        <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 gap-1 rounded-lg bg-[#2a2035] p-2 shadow-lg">
                            {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className="cursor-pointer rounded p-1 text-xl hover:bg-white/10"
                                    onClick={() => {
                                        onReaction(emoji);
                                        setEmojiOpen(false);
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <ControlButton
                    active={sidePanel === "canvas"}
                    onClick={onToggleCanvas}
                    icon={<FileText className="size-5" />}
                    label="Canvas"
                />
                <ControlButton
                    active={sidePanel === "thread"}
                    onClick={onToggleThread}
                    icon={<MessageSquare className="size-5" />}
                    label="Thread"
                />
                <ControlButton
                    active={false}
                    onClick={() => {}}
                    icon={<MoreVertical className="size-5" />}
                    label="More"
                />
            </div>
            <Button
                type="button"
                variant="destructive"
                className="ml-4 cursor-pointer gap-2 bg-red-600 hover:bg-red-700"
                onClick={onLeave}
            >
                <PhoneOff className="size-4" />
                Leave
            </Button>
        </div>
    );
}

function ControlButton({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={cn(
                "flex size-10 cursor-pointer items-center justify-center rounded-lg transition-colors",
                active
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
        >
            {icon}
        </button>
    );
}
