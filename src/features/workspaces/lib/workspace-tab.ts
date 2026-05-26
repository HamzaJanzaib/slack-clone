export const WORKSPACE_TAB_PARAM = "tab";

export type WorkspaceTab =
    | "setup"
    | "huddles"
    | "directories"
    | `channel-${string}`;

export const DEFAULT_WORKSPACE_TAB: WorkspaceTab = "huddles";

const CHANNEL_PREFIX = "channel-";

export function parseWorkspaceTab(value: string | null): WorkspaceTab | null {
    if (!value) return null;
    if (value === "setup" || value === "huddles" || value === "directories") {
        return value;
    }
    if (value.startsWith(CHANNEL_PREFIX)) {
        const channelId = value.slice(CHANNEL_PREFIX.length);
        if (channelId.length > 0) return value as WorkspaceTab;
    }
    return null;
}

export function channelTabId(channelId: string): WorkspaceTab {
    return `channel-${channelId}`;
}

export function getChannelIdFromTab(tab: WorkspaceTab): string | null {
    if (!tab.startsWith(CHANNEL_PREFIX)) return null;
    return tab.slice(CHANNEL_PREFIX.length);
}

export function isSetupTab(tab: WorkspaceTab): boolean {
    return tab === "setup";
}
