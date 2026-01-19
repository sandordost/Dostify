"use server";

import { songQueueStoreServer } from "@/lib/server/song-queue-store.server";
import YtPlayer from "@/lib/types/players/yt-player";

function player() {
    return new YtPlayer();
}

export async function togglePlayAction() {
    const p = player();
    const isPlaying = await p.IsPlaying();
    if (isPlaying) await p.Pause();
    else await p.Play();
    return { isPlaying: !isPlaying };
}

export async function nextSongAction() {
    const nextSong = songQueueStoreServer.next();
    if (!nextSong) return { ok: false as const };

    const p = new YtPlayer();
    await p.PlaySong(nextSong);

    const song = await p.GetCurrentSong();
    const isPlaying = await p.IsPlaying();

    return { ok: true as const, song, isPlaying };
}


export async function prevSongAction() {
    const p = player();
    await p.PreviousSong();
    const song = await p.GetCurrentSong();
    const isPlaying = await p.IsPlaying();
    return { ok: true as const, song, isPlaying };
}

export async function getStateAction() {
    const p = player();
    const song = await p.GetCurrentSong();
    const isPlaying = await p.IsPlaying();
    const volume = await p.GetVolumePercent();
    return { song, isPlaying, volume };
}

export async function setVolumeAction(volumePercent: number) {
    const p = player();
    await p.SetVolumePercent(volumePercent);
    return { ok: true as const };
}

export async function seekAction(seconds: number) {
    const p = player();
    await p.SetPlaybackTime(seconds);
    return { ok: true as const };
}
