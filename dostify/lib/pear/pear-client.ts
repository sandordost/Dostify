import { getPearApiUrlServer } from "./pear-config.server";

export type PearSongResponse = {
    isPaused: boolean;
    elapsedSeconds?: number;
    songDuration?: number;
    title?: string;
    artist?: string;
    imageSrc?: string;
    url?: string;
    videoId?: string;
};

export type SeekToRequest = {
    seconds: number;
}

export type VolumeResponse = {
    state: number;
    isMuted: boolean;
}

export type PearQueueResponse = {
    items: unknown[];
}

async function pearRequest<T = unknown>(
    path: string,
    options: { method?: "GET" | "POST" | "DELETE" | "PATCH"; body?: any } = {}
): Promise<T> {
    const base = getPearApiUrlServer().replace(/\/+$/, "");
    const method = options.method ?? "POST";

    const res = await fetch(`${base}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" || method === "PATCH" ? JSON.stringify(options.body ?? {}) : undefined,
    });

    const contentType = res.headers.get("content-type") ?? "";
    const raw = await res.text();

    const data = contentType.includes("application/json") && raw
        ? (JSON.parse(raw) as T)
        : (undefined as unknown as T);

    if (!res.ok) {
        throw new Error(`Pear ${method} ${path} failed (${res.status}). Body: ${raw.slice(0, 300)}`);
    }

    return (data ?? (raw as unknown as T));
}

export const pearClient = {
    play: () => pearRequest<void>("/play", { method: "POST" }),
    pause: () => pearRequest<void>("/pause", { method: "POST" }),

    getSong: () => pearRequest<PearSongResponse>("/song", { method: "GET" }),

    isPlaying: async () => {
        const song = await pearRequest<PearSongResponse>("/song", { method: "GET" });
        return !song.isPaused;
    },

    seekTo: async (request: SeekToRequest) => pearRequest<void>("/seek-to", {
        method: "POST", body: request
    }),

    getVolume: async () => pearRequest<VolumeResponse>("/volume", { method: "GET" }),

    setVolume: async (percent: number) => pearRequest<void>("/volume", { method: "POST", body: { volume: percent } }),

    nextSong: async () => pearRequest<void>("/next", { method: "POST" }),

    previousSong: async () => pearRequest<void>("/previous", { method: "POST" }),

    addSongToQueue: async (id: string) => pearRequest<void>("/queue", { method: "POST", body: { videoId: id, insertPosition: "INSERT_AFTER_CURRENT_VIDEO" } }),

    clearQueue: async () => pearRequest<void>("/queue", { method: "DELETE" }),

    getQueue: async () => pearRequest<PearQueueResponse>("/queue", { method: "GET" }),

    playQueueIndex: async (index: number) => pearRequest<void>("/queue", { method: "PATCH", body: { index: index } })
};