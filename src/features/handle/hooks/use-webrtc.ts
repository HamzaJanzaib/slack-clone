"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type UseWebRtcOptions = {
    sessionId: Id<"handleSessions"> | null;
    localUserId: Id<"users"> | null;
    remoteUserIds: Id<"users">[];
    enabled: boolean;
};

export function useWebRtc({
    sessionId,
    localUserId,
    remoteUserIds,
    enabled,
}: UseWebRtcOptions) {
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<
        Map<string, MediaStream>
    >(new Map());
    const lastSignalRef = useRef(0);
    const sendSignal = useMutation(api.handles.sendSignal);

    const signals = useQuery(
        api.handles.getSignalsForUser,
        sessionId && enabled
            ? { sessionId, since: lastSignalRef.current }
            : "skip",
    );

    const updateRemoteStreams = useCallback(() => {
        const next = new Map<string, MediaStream>();
        peersRef.current.forEach((pc, userId) => {
            const stream = new MediaStream();
            pc.getReceivers().forEach((receiver) => {
                if (receiver.track) stream.addTrack(receiver.track);
            });
            if (stream.getTracks().length > 0) {
                next.set(userId, stream);
            }
        });
        setRemoteStreams(next);
    }, []);

    const getPeer = useCallback(
        async (remoteUserId: Id<"users">) => {
            if (!sessionId || !localUserId) return null;
            const key = remoteUserId;
            if (peersRef.current.has(key)) {
                return peersRef.current.get(key)!;
            }

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });

            localStreamRef.current?.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current!);
            });

            pc.onicecandidate = (event) => {
                if (!event.candidate) return;
                void sendSignal({
                    sessionId,
                    toUserId: remoteUserId,
                    type: "ice",
                    payload: JSON.stringify(event.candidate),
                });
            };

            pc.ontrack = () => {
                updateRemoteStreams();
            };

            peersRef.current.set(key, pc);
            return pc;
        },
        [localUserId, sendSignal, sessionId, updateRemoteStreams],
    );

    const startLocalMedia = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) return null;
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
    }, []);

    useEffect(() => {
        if (!enabled || !sessionId || !localUserId) return;

        void startLocalMedia();

        return () => {
            localStreamRef.current?.getTracks().forEach((t) => t.stop());
            peersRef.current.forEach((pc) => pc.close());
            peersRef.current.clear();
            localStreamRef.current = null;
            setLocalStream(null);
            setRemoteStreams(new Map());
        };
    }, [enabled, localUserId, sessionId, startLocalMedia]);

    useEffect(() => {
        if (!enabled || !sessionId || !localUserId || remoteUserIds.length === 0) {
            return;
        }

        const sorted = [...remoteUserIds].sort();
        const isInitiator =
            sorted.length === 0 ||
            localUserId < sorted[0];

        void (async () => {
            for (const remoteId of remoteUserIds) {
                const pc = await getPeer(remoteId);
                if (!pc) continue;

                if (isInitiator && localUserId < remoteId) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    await sendSignal({
                        sessionId,
                        toUserId: remoteId,
                        type: "offer",
                        payload: JSON.stringify(offer),
                    });
                }
            }
        })();
    }, [
        enabled,
        getPeer,
        localUserId,
        remoteUserIds,
        sendSignal,
        sessionId,
    ]);

    useEffect(() => {
        if (!signals?.length || !sessionId || !localUserId) return;

        void (async () => {
            for (const signal of signals) {
                lastSignalRef.current = Math.max(
                    lastSignalRef.current,
                    signal.createdAt,
                );

                const pc = await getPeer(signal.fromUserId);
                if (!pc) continue;

                if (signal.type === "offer") {
                    const offer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
                    await pc.setRemoteDescription(offer);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    await sendSignal({
                        sessionId,
                        toUserId: signal.fromUserId,
                        type: "answer",
                        payload: JSON.stringify(answer),
                    });
                } else if (signal.type === "answer") {
                    const answer = JSON.parse(
                        signal.payload,
                    ) as RTCSessionDescriptionInit;
                    await pc.setRemoteDescription(answer);
                } else if (signal.type === "ice") {
                    const candidate = JSON.parse(
                        signal.payload,
                    ) as RTCIceCandidateInit;
                    await pc.addIceCandidate(candidate);
                }
            }
            updateRemoteStreams();
        })();
    }, [signals, sessionId, localUserId, getPeer, sendSignal, updateRemoteStreams]);

    const toggleMic = useCallback((enabled: boolean) => {
        localStreamRef.current?.getAudioTracks().forEach((track) => {
            track.enabled = enabled;
        });
    }, []);

    const toggleCamera = useCallback(async (enabled: boolean) => {
        if (!localStreamRef.current) return;

        if (enabled) {
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            const videoTrack = videoStream.getVideoTracks()[0];
            if (videoTrack) {
                localStreamRef.current.addTrack(videoTrack);
                peersRef.current.forEach((pc) => {
                    pc.addTrack(videoTrack, localStreamRef.current!);
                });
            }
        } else {
            localStreamRef.current.getVideoTracks().forEach((track) => {
                track.stop();
                localStreamRef.current?.removeTrack(track);
            });
        }
        setLocalStream(
            localStreamRef.current
                ? new MediaStream(localStreamRef.current.getTracks())
                : null,
        );
    }, []);

    return {
        localStream,
        remoteStreams,
        toggleMic,
        toggleCamera,
        startLocalMedia,
    };
}
