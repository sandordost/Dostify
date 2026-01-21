"use server";

import { songQueueStoreServer } from "@/lib/server/song-queue-store.server";
import { playerStoreServer } from "@/lib/server/player-store-server";
import MusicPlayer from "@/lib/types/players/music-player";
import { PlayerType } from "@/lib/types/players/player-type";
import { BasePlayer } from "@/lib/types/players/base-player";
import YtMusicPlayer from "@/lib/types/players/yt-music-player";
import { RadioStation } from "@/lib/types/radio-station";
import { mpv, mpvGetMany } from "@/lib/server/mpv";
import { RadioPlayer } from "@/lib/types/players/radio-player";

function player() {
    return playerStoreServer.getCurrentPlayer();
}

export async function getPlayerType(): Promise<PlayerType | undefined> {
    const p = player();

    if (p instanceof YtMusicPlayer) return 'YtMusic'
    if (p instanceof RadioPlayer) return 'Radio'

    return undefined;
}

export async function toggleMusicOrRadioPlayerAction(): Promise<void> {
    const p = player();

    await p?.Pause();

    if (p instanceof RadioPlayer) playerStoreServer.setCurrentPlayer(new YtMusicPlayer());
    if (p instanceof MusicPlayer) playerStoreServer.setCurrentPlayer(new RadioPlayer());

    await player()?.Play();
}

export async function togglePlayAction() {
    const p = player();

    if (p instanceof BasePlayer) {
        const isPlaying = await p?.IsPlaying();
        if (isPlaying) await p?.Pause();
        else await p?.Play();
        return { isPlaying: !isPlaying };
    }
}

export async function nextSongAction() {
    const p = player();
    if (p instanceof MusicPlayer) {
        const nextSong = songQueueStoreServer.next();
        if (!nextSong) return { ok: false as const };

        await p.PlaySong(nextSong);

        const song = await p.GetCurrentSong();
        const isPlaying = await p.IsPlaying();

        return { ok: true as const, song, isPlaying };
    }
}

export async function prevSongAction() {
    const p = player();
    if (p instanceof MusicPlayer) {
        await p?.PreviousSong();
        const song = await p.GetCurrentSong();
        const isPlaying = await p.IsPlaying();
        return { ok: true as const, song, isPlaying };
    }
}

export async function getSongStateAction() {
    const p = player();
    if (p instanceof MusicPlayer) {
        const song = await p.GetCurrentSong();
        const isPlaying = await p.IsPlaying();
        return { song, isPlaying };
    }
}

export async function getVolumeAction() {
    const p = player();
    if (p instanceof BasePlayer) {
        const volume = await p.GetVolumePercent();
        return { volume };
    }
}

export async function setVolumeAction(volumePercent: number) {
    const p = player();
    if (p instanceof BasePlayer) {
        await p?.SetVolumePercent(volumePercent);
        return { ok: true as const };
    }
}

export async function songSeekAction(seconds: number) {
    const p = player();
    if (p instanceof MusicPlayer) {
        await p.SetPlaybackTime(seconds);
        return { ok: true as const };
    }
}

export async function playRadioStationAction(station: RadioStation) {
    const p = player();
    if (!(p instanceof RadioPlayer)) return { ok: false as const };

    await p.SetRadioStation(station);
    const s: any = station;
    const url = s.url_resolved ?? s.url;
    if (!url) return { ok: false as const, error: "No stream url" };

    await mpv({ command: ["loadfile", url, "replace"] });
    await mpv({ command: ["set_property", "pause", false] });

    return { ok: true as const, url };
}

function parseIcyTitle(icyTitle?: string) {
    if (!icyTitle) return { artist: undefined as string | undefined, title: undefined as string | undefined };

    const parts = icyTitle.split(" - ");
    if (parts.length >= 2) {
        const artist = parts.shift()!.trim();
        const title = parts.join(" - ").trim();
        return { artist, title };
    }
    return { artist: undefined, title: icyTitle.trim() };
}

export async function getRadioStationStateAction() {
    const p = playerStoreServer.getCurrentPlayer();
    if (!(p instanceof RadioPlayer)) return { ok: false as const };

    const props = await mpvGetMany([
        "media-title",
        "metadata/by-key/icy-title",
        "metadata/by-key/icy-name",
        "time-pos",
        "duration",
        "demuxer-cache-time",
        "cache-used",
        "pause",
    ]);

    const icyTitle = typeof props["metadata/by-key/icy-title"] === "string" ? props["metadata/by-key/icy-title"] : undefined;
    const icyName = typeof props["metadata/by-key/icy-name"] === "string" ? props["metadata/by-key/icy-name"] : undefined;
    const mediaTitle = typeof props["media-title"] === "string" ? props["media-title"] : undefined;

    const { artist, title } = parseIcyTitle(icyTitle);

    const timeElapsed = typeof props["time-pos"] === "number" ? props["time-pos"] : 0;
    const duration = typeof props["duration"] === "number" ? props["duration"] : null;

    const cacheSeconds = typeof props["demuxer-cache-time"] === "number" ? props["demuxer-cache-time"] : 0;

    const isPlaying = !(props["pause"] === true);
    const currentStation = p.getCurrentStation();
    console.log(currentStation?.favicon);

    return {
        ok: true as const,
        station: currentStation?.name ?? icyName ?? mediaTitle ?? null,
        nowPlaying: {
            raw: icyTitle ?? null,
            artist: artist ?? null,
            title: title ?? null,
        },
        timeElapsedSeconds: Math.round(timeElapsed),
        durationSeconds: duration ? Math.round(duration) : null,
        cacheSeconds: Math.round(cacheSeconds),
        isPlaying,
        thumbnailUrl: currentStation?.favicon,
        url: currentStation?.url_resolved,
    };
}
