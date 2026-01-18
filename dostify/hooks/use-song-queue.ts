"use client"

import { useSyncExternalStore } from "react";
import { songQueueStore } from "@/lib/types/song-queue-store";
import { Song } from "@/lib/types/song";

const EMPTY_QUEUE: Song[] = []; // ✅ cached, altijd dezelfde referentie

export function useSongQueue() {
    const queue = useSyncExternalStore(
        (cb) => songQueueStore.subscribe(cb),
        () => songQueueStore.getSnapshot(),
        () => EMPTY_QUEUE
    );

    return {
        queue,
        addToQueue: (song: Song) => songQueueStore.add(song),
        getNextInQueue: () => songQueueStore.next(),
        clearQueue: () => songQueueStore.clear(),
    };
}
