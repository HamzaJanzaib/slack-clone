const REDIRECT_PARAM = "redirect";

/** Only allow same-origin relative paths (prevents open redirects). */
export function getSafeRedirectPath(
    path: string | null | undefined,
    fallback = "/",
): string {
    if (!path) return fallback;
    if (!path.startsWith("/") || path.startsWith("//")) return fallback;
    return path;
}

export function getRedirectFromSearchParams(
    searchParams: URLSearchParams,
    fallback = "/",
): string {
    return getSafeRedirectPath(searchParams.get(REDIRECT_PARAM), fallback);
}

export function buildAuthUrl(returnPath: string): string {
    const safePath = getSafeRedirectPath(returnPath, "/");
    return `/auth?${REDIRECT_PARAM}=${encodeURIComponent(safePath)}`;
}

export function getRequestReturnPath(pathname: string, search: string): string {
    return pathname + search;
}
