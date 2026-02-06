export type MusicService = "yt-music" | "spotify" | 'radio';

export interface Song {
    id: string;
    service: MusicService;
    url: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    elapsedTime: number;
    views: number;
    viewsString: string;
    songDuration: number;
}