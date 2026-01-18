
import { Song } from "@/lib/types/song";

export class SongQueueStore {
    private queue: Song[] = [];
    private listeners = new Set<() => void>();

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private emit() {
        for (const l of this.listeners) l();
    }

    getSnapshot() {
        return this.queue;
    }

    add(song: Song) {
        this.queue = [...this.queue, song];
        this.emit();
    }

    next(): Song | null {
        const next = this.queue[0] ?? null;
        if (!next) return null;
        this.queue = this.queue.slice(1);
        this.emit();
        return next;
    }

    clear() {
        this.queue = [];
        this.emit();
    }
}

export const songQueueStore = new SongQueueStore();