export type MediaPermissionState = {
    microphone: PermissionState | "unsupported";
    camera: PermissionState | "unsupported";
};

export async function requestMediaPermissions(options?: {
    audio?: boolean;
    video?: boolean;
}): Promise<MediaStream | null> {
    if (!navigator.mediaDevices?.getUserMedia) {
        return null;
    }

    try {
        return await navigator.mediaDevices.getUserMedia({
            audio: options?.audio ?? true,
            video: options?.video ?? false,
        });
    } catch {
        return null;
    }
}

export async function checkMediaPermissions(): Promise<MediaPermissionState> {
    if (!navigator.permissions?.query) {
        return { microphone: "unsupported", camera: "unsupported" };
    }

    try {
        const [mic, cam] = await Promise.all([
            navigator.permissions.query({
                name: "microphone" as PermissionName,
            }),
            navigator.permissions.query({ name: "camera" as PermissionName }),
        ]);
        return {
            microphone: mic.state,
            camera: cam.state,
        };
    } catch {
        return { microphone: "unsupported", camera: "unsupported" };
    }
}
