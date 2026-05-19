export function getWorkspaceInviteUrl(inviteCode: string): string {
    if (typeof window === "undefined") {
        return `/join/${inviteCode}`;
    }
    return `${window.location.origin}/join/${inviteCode}`;
}
