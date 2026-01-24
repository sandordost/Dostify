"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Song } from "@/lib/types/song";
import { addToQueueAction, clearQueueAction, getQueueAction } from "@/app/actions/queue";

export function useSongQueue() {
    const [queue, setQueue] = useState<Song[]>([]);
    const pollingRef = useRef<number | null>(null);

    const refresh = useCallback(async () => {
        const q = await getQueueAction();
        setQueue(q);
    }, []);

    useEffect(() => {
        refresh();

        pollingRef.current = window.setInterval(() => {
            refresh();
        }, 1500);

        return () => {
            if (pollingRef.current) window.clearInterval(pollingRef.current);
        };
    }, [refresh]);

    const addToQueue = useCallback(async (song: Song) => {
        const q = await addToQueueAction(song);
        setQueue(q);
    }, []);

    const clearQueue = useCallback(async () => {
        const q = await clearQueueAction();
        setQueue(q);
    }, []);

    return { queue, addToQueue, clearQueue, refresh };
}
