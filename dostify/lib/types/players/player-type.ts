import RadioPlayer from "./radio-player";
import YtMusicPlayer from "./yt-music-player";

export type PlayerType = "YtMusic" | "Radio";

export function createPlayer(type: PlayerType) {
    switch (type) {
        case "YtMusic":
            return new YtMusicPlayer();
        case "Radio":
            return new RadioPlayer();
    }
}