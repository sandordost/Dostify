export type MusicService = "yt-music" | "spotify";

export interface Song {
    id: string;
    service: MusicService;
    url: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    elapsedTime: number;
    songDuration: number;
}