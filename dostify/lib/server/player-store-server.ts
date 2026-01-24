import { BasePlayer } from "../types/players/base-player";
import YtMusicPlayer from "../types/players/yt-music-player";
import { startAutoSongAdvanceLoop } from "./song-auto-advance";

startAutoSongAdvanceLoop();

class PlayerStoreServer {
    private currentPlayer: BasePlayer | undefined = new YtMusicPlayer();

    public getCurrentPlayer(): BasePlayer | undefined {
        return this.currentPlayer;
    }

    public setCurrentPlayer(player: BasePlayer) {
        this.currentPlayer = player;
    }
}

export const playerStoreServer = new PlayerStoreServer();