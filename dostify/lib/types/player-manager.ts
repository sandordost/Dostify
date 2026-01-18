import { BasePlayer } from "./players/player";
import YtPlayer from "./players/yt-player";
import { songQueueStore } from "./song-queue-store";

export default class PlayerManager {
    players: BasePlayer[] = [];
    currentPlayer: BasePlayer | null = null;

    constructor() {
        const ytPlayer = new YtPlayer();
        this.players.push(ytPlayer)
        this.currentPlayer = ytPlayer;
    }

    public async TogglePlay() {
        const isPlaying = await this.currentPlayer?.IsPlaying();
        if (!this.currentPlayer) return;
        if (isPlaying) await this.currentPlayer.Pause();
        else await this.currentPlayer.Play();
    }

    public async PlayNextSong() {
        const nextSong = songQueueStore.next();
        if (!nextSong || !this.currentPlayer) return;

        await this.PauseAll();
        await this.currentPlayer.PlaySong(nextSong);
    }

    private async PauseAll() {
        await Promise.all(this.players.map(p => p.Pause()));
    }
}