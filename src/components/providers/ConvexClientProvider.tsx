"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useEffect } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // #region agent log
        fetch("http://127.0.0.1:7301/ingest/b333104d-e9fd-48aa-90ec-9ab74aad7a08", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Debug-Session-Id": "334b13",
            },
            body: JSON.stringify({
                sessionId: "334b13",
                runId: "pre-fix",
                hypothesisId: "H2",
                location: "ConvexClientProvider.tsx",
                message: "Convex client provider mounted",
                data: {
                    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL ?? null,
                },
                timestamp: Date.now(),
            }),
        }).catch(() => {});
        // #endregion
    }, []);

    return (
        <ConvexAuthNextjsProvider client={convex}>
            {children}  
        </ConvexAuthNextjsProvider>
    );
}