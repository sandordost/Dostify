import { MusicService, Song } from "../song";

export abstract class BasePlayer {
    public abstract service: MusicService;
    public abstract Play(): Promise<void>;
    public abstract PlaySong(song: Song): Promise<void>
    public abstract Pause(): Promise<void>;
    public abstract IsPlaying(): Promise<boolean>;
    public abstract GetCurrentSong(): Promise<Song>;
    public abstract SetPlaybackTime(seconds: number): Promise<void>
    public abstract GetVolumePercent(): Promise<number>
    public abstract SetVolumePercent(percent: number): Promise<void>
    public abstract NextSong(): Promise<void>
    public abstract PreviousSong(): Promise<void>
}