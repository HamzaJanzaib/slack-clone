import * as React from "react";

export const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const media = window.matchMedia(
            `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
        );
        const update = () => setIsMobile(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    return isMobile;
}

export function useBodyScrollLock(locked: boolean) {
    React.useEffect(() => {
        if (!locked) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };
    }, [locked]);
}
