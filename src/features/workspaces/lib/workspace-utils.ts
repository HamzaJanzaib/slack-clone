export function getWorkspaceInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function getMemberInitials(
    name?: string | null,
    fallback = "?",
): string {
    if (name) {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 1);
    }
    return fallback;
}
