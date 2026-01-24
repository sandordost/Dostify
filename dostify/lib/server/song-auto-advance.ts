"use server";

import { getSongStateAction, nextSongAction } from "@/app/actions/player";
import { playerStoreServer } from "@/lib/server/player-store-server";
import MusicPlayer from "@/lib/types/players/music-player";
import { sleep } from "@/lib/utils";

let autoLoopStarted = false;

export async function startAutoSongAdvanceLoop() {
    if (autoLoopStarted) return;
    autoLoopStarted = true;

    console.log("[auto-next] loop started");

    (async () => {
        while (true) {
            try {
                await checkIfShouldAdvance();
            } catch (err) {
                console.error("[auto-next] error:", err);
            }

            await sleep(1000);
        }
    })();
}

async function checkIfShouldAdvance() {
    const p = playerStoreServer.getCurrentPlayer();

    if (!(p instanceof MusicPlayer)) return;

    const state = await getSongStateAction();
    if (!state) return;
    if (!state.isPlaying) return;

    const elapsed = state.song?.elapsedTime ?? 0;
    const duration = state.song?.songDuration ?? 0;

    if (!duration || duration <= 0) return;

    const timeUntilNext = 3;

    if (duration - elapsed <= timeUntilNext) {
        console.log("[auto-next] advancing…");
        await nextSongAction();
    }
}
