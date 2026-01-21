import { MusicService, Song } from "../song";
import { BasePlayer } from "./base-player";

export default abstract class MusicPlayer extends BasePlayer {
    public abstract service: MusicService;
    public abstract PlaySong(song: Song): Promise<void>
    public abstract GetCurrentSong(): Promise<Song>;
    public abstract SetPlaybackTime(seconds: number): Promise<void>
    public abstract NextSong(): Promise<void>
    public abstract PreviousSong(): Promise<void>
}