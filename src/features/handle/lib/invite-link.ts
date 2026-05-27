export function getEmailInviteUrl(token: string): string {
    if (typeof window === "undefined") {
        return `/join/invite/${token}`;
    }
    return `${window.location.origin}/join/invite/${token}`;
}
