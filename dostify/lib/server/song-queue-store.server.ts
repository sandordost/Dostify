import type { Song } from "@/lib/types/song";

type Listener = () => void;

class SongQueueStoreServer {
    private queue: Song[] = [];
    private listeners = new Set<Listener>();

    getSnapshot() {
        return this.queue;
    }

    subscribe(cb: Listener) {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    }

    private emit() {
        for (const cb of this.listeners) cb();
    }

    add(song: Song) {
        this.queue = [...this.queue, song];
        this.emit();
    }

    clear() {
        this.queue = [];
        this.emit();
    }

    next() {
        const [head, ...rest] = this.queue;
        this.queue = rest;
        this.emit();
        return head;
    }
}

export const songQueueStoreServer = new SongQueueStoreServer();
