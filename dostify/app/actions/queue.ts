"use server";

import type { Song } from "@/lib/types/song";
import { songQueueStoreServer } from "@/lib/server/song-queue-store.server";

export async function getQueueAction(): Promise<Song[]> {
    return songQueueStoreServer.getSnapshot();
}

export async function addToQueueAction(song: Song): Promise<Song[]> {
    songQueueStoreServer.add(song);
    return songQueueStoreServer.getSnapshot();
}

export async function popNextFromQueueAction(): Promise<Song | null> {
    return songQueueStoreServer.next() ?? null;
}

export async function clearQueueAction(): Promise<Song[]> {
    songQueueStoreServer.clear();
    return songQueueStoreServer.getSnapshot();
}
