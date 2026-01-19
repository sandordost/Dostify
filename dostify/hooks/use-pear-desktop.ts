"use client";

import * as React from "react";
import type { Song } from "@/lib/types/song";
import type { PearSearchBody, PearSearchResponse } from "@/lib/types/pear-search";
import { pearSearchRawAction, pearSearchSongsAction } from "@/app/actions/pear-search";

type PearError = {
    message: string;
    details?: unknown;
};

export function usePearDesktop() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<PearError | null>(null);
    const [lastResponse, setLastResponse] = React.useState<PearSearchResponse | null>(null);

    // Abort werkt niet echt met server actions; dit is een "soft cancel"
    const reqIdRef = React.useRef(0);

    const searchRaw = React.useCallback(async (body: PearSearchBody) => {
        const reqId = ++reqIdRef.current;

        setLoading(true);
        setError(null);

        try {
            const data = await pearSearchRawAction(body);

            // als er intussen een nieuw request is gestart, negeer deze response
            if (reqId !== reqIdRef.current) return null;

            setLastResponse(data);
            setLoading(false);
            return data;
        } catch (e) {
            if (reqId !== reqIdRef.current) return null;

            setError({ message: e instanceof Error ? e.message : "Unknown error", details: e });
            setLoading(false);
            return null;
        }
    }, []);

    const searchSongs = React.useCallback(async (body: PearSearchBody): Promise<Song[]> => {
        const reqId = ++reqIdRef.current;

        setLoading(true);
        setError(null);

        try {
            const songs = await pearSearchSongsAction(body);

            if (reqId !== reqIdRef.current) return [];

            setLoading(false);
            return songs;
        } catch (e) {
            if (reqId !== reqIdRef.current) return [];

            setError({ message: e instanceof Error ? e.message : "Unknown error", details: e });
            setLoading(false);
            return [];
        }
    }, []);

    const cancel = React.useCallback(() => {
        // we kunnen het lopende server request niet killen,
        // maar we zorgen wel dat UI de response negeert.
        reqIdRef.current++;
        setLoading(false);
    }, []);

    return { searchRaw, searchSongs, cancel, loading, error, lastResponse };
}
