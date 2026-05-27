import { atom, useAtom } from "jotai";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { HandleSidePanel } from "../types";

const activeSessionIdAtom = atom<Id<"handleSessions"> | null>(null);
const sidePanelAtom = atom<HandleSidePanel>(null);
const startModalOpenAtom = atom(false);
const permissionGateOpenAtom = atom(false);
const pendingTargetAtom = atom<{
    type: "dm" | "channel";
    channelId?: Id<"channels">;
    targetUserId?: Id<"users">;
    label: string;
} | null>(null);

export function useHandleStore() {
    const [activeSessionId, setActiveSessionId] = useAtom(activeSessionIdAtom);
    const [sidePanel, setSidePanel] = useAtom(sidePanelAtom);
    const [startModalOpen, setStartModalOpen] = useAtom(startModalOpenAtom);
    const [permissionGateOpen, setPermissionGateOpen] = useAtom(
        permissionGateOpenAtom,
    );
    const [pendingTarget, setPendingTarget] = useAtom(pendingTargetAtom);

    return {
        activeSessionId,
        setActiveSessionId,
        sidePanel,
        setSidePanel,
        startModalOpen,
        setStartModalOpen,
        permissionGateOpen,
        setPermissionGateOpen,
        pendingTarget,
        setPendingTarget,
    };
}
