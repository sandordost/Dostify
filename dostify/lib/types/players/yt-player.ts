import { sleep } from "@/lib/utils";
import { MusicService, Song } from "../song";
import { BasePlayer } from "./player";
import { pearClient } from "@/lib/pear/pear-client";

export default class YtPlayer extends BasePlayer {
    public async PlaySong(song: Song): Promise<void> {
        await pearClient.addSongToQueue(song.id);
        await sleep(400);
        const queue = await pearClient.getQueue();
        const queueCount = queue.items.length;
        console.log(queueCount);
        await pearClient.playQueueIndex(queueCount - 1);
        await pearClient.nextSong();
    }

    public service: MusicService = 'yt-music';

    public NextSong(): Promise<void> {
        return pearClient.nextSong();
    }

    public PreviousSong(): Promise<void> {
        return pearClient.previousSong();
    }

    public async GetVolumePercent(): Promise<number> {
        const volRes = await pearClient.getVolume();
        return volRes.state;
    }

    public SetVolumePercent(percent: number): Promise<void> {
        return pearClient.setVolume(percent)
    }

    public SetPlaybackTime(seconds: number): Promise<void> {
        return pearClient.seekTo({ seconds: seconds })
    }

    async GetCurrentSong(): Promise<Song> {
        const songRes = await pearClient.getSong();
        const song: Song = {
            id: songRes.videoId || '',
            title: songRes.title || '',
            service: 'yt-music',
            url: songRes.url || '',
            artist: songRes.artist || '',
            thumbnailUrl: songRes.imageSrc || '',
            songDuration: songRes.songDuration || 0,
            elapsedTime: songRes.elapsedSeconds || 0
        }

        return song;
    }

    async IsPlaying(): Promise<boolean> {
        const r = await pearClient.isPlaying();
        return r;
    }

    Play(): Promise<void> {
        return pearClient.play();
    }

    Pause(): Promise<void> {
        return pearClient.pause();
    }
}
