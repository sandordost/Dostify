"use client";

import { clamp, cn, formatTime } from "@/lib/utils";
import AudioItem from "../ui/audio-item";
import { useEffect, useRef, useState } from "react";
import { LucideVolume2, PlayCircle, SkipForward, SkipBack, PauseCircle } from "lucide-react";
import { AudioSlider } from "../ui/audio-slider";
import type { Song } from "@/lib/types/song";

import {
    togglePlayAction,
    nextSongAction,
    prevSongAction,
    getSongStateAction,
    setVolumeAction,
    songSeekAction,
    getVolumeAction,
    getRadioStationStateAction,
} from "@/app/actions/player";
import { useIsMobile } from "@/hooks/use-mobile";
import { VolumeSlider } from "../ui/volume-slider";

type PlayerProps = {
    className?: string;
    onSongChange?: (song?: Song) => void;
    radioMode: boolean;
};

export default function AppPlayer({ className, onSongChange, radioMode }: PlayerProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const [maxTime, setMaxTime] = useState(180);
    const [volumeValue, setVolumeValue] = useState<number[]>([65]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | undefined>(undefined);

    const isMobile = useIsMobile();

    const timeUntilNextSong = 3;

    const pollLockRef = useRef(false);
    const pollTimerRef = useRef<number | null>(null);

    async function refreshState() {
        if (!radioMode) {
            // Music Mode
            const s = await getSongStateAction();
            if (!s) return;

            const elapsed = s.song?.elapsedTime || 0;
            const dur = s.song?.songDuration || 0;

            setCurrentSong(s.song);
            emitSongChange(s.song);
            setCurrentTime(elapsed);
            setMaxTime(dur);
            setIsPlaying(s.isPlaying);
        }
        else {
            // Radio Mode
            const radioState = await getRadioStationStateAction();
            const vol = await getVolumeAction();
            setVolumeValue([Math.round(vol?.volume ?? 0)]);
            setCurrentTime(radioState.timeElapsedSeconds ?? 0);
            setMaxTime(radioState.cacheSeconds ?? radioState.timeElapsedSeconds ?? 0);
            setIsPlaying(radioState.isPlaying ?? false);
            const radioToSong: Song = {
                id: `${radioState.station}-${radioState.nowPlaying}`,
                thumbnailUrl: radioState.thumbnailUrl ?? "",
                service: 'radio',
                url: radioState.url ?? "",
                title: radioState.station ?? "Onbekend station",
                artist: `${radioState.nowPlaying?.artist} - ${radioState.nowPlaying?.title}`,
                elapsedTime: radioState.timeElapsedSeconds ?? 0,
                viewsString: "",
                views: 0,
                songDuration: radioState.cacheSeconds ?? 0,
            }
            setCurrentSong(radioToSong);
            console.log(radioState);
        }
    }

    const lastSongIdRef = useRef<string | number | null>(null);

    function emitSongChange(song?: Song) {
        const id = (song?.id ?? song?.id ?? null) as any;
        if (id === lastSongIdRef.current) return;
        lastSongIdRef.current = id;
        onSongChange?.(song);
    }

    async function playButtonPressed() {
        const r = await togglePlayAction();
        if (!r) return;
        setIsPlaying(r.isPlaying);
    }

    async function previousButtonClicked() {
        const r = await prevSongAction();
        if (!r) return;
        if (r.ok) {
            setCurrentSong(r.song);
            emitSongChange(r.song);
            setIsPlaying(r.isPlaying);
            setCurrentTime(r.song?.elapsedTime || 0);
            setMaxTime(r.song?.songDuration || 0);
        }
    }

    async function nextButtonClicked() {
        const r = await nextSongAction();
        if (!r) return;
        if (r.ok) {
            setCurrentSong(r.song);
            emitSongChange(r.song);
            setIsPlaying(r.isPlaying);
            setCurrentTime(r.song?.elapsedTime || 0);
            setMaxTime(r.song?.songDuration || 0);
        }
    }

    async function currentTimeValueChanged(seconds: number) {
        setCurrentTime(seconds);
        await songSeekAction(seconds);
    }

    async function volumeValueChanged(volume: number[]) {
        setVolumeValue(volume);
        await setVolumeAction(volume[0]);
    }

    useEffect(() => {
        let cancelled = false;

        async function tick() {
            if (cancelled) return;

            if (!pollLockRef.current) {
                pollLockRef.current = true;
                try {
                    await refreshState();
                } finally {
                    pollLockRef.current = false;
                }
            }

            const intervalMs = radioMode ? 1500 : 800;

            pollTimerRef.current = window.setTimeout(tick, intervalMs);
        }

        tick();

        return () => {
            cancelled = true;
            if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current);
        };
    }, [radioMode]);

    return (
        <div className={cn(className, "px-4 bg-[rgba(0,0,0,0.96)] flex flex-col w-full rounded-t-xl")}>
            <div className="flex flex-row justify-around w-full">
                <AudioItem
                    className="flex-1 justify-start overflow-hidden"
                    title={currentSong?.title || "Unknown"}
                    description={currentSong?.artist}
                    imageSrc={currentSong?.thumbnailUrl}
                    mode="player"
                    isMobile={isMobile}

                />

                <div className="flex flex-row gap-4 flex-1 items-center justify-center">
                    {!radioMode && (
                        <div onClick={previousButtonClicked}>
                            <SkipBack size={isMobile ? 20 : 30} color="rgb(220,220,220)" />
                        </div>
                    )}

                    <div onClick={playButtonPressed}>
                        {!isPlaying && <PlayCircle size={isMobile ? 30 : 50} color="white" />}
                        {isPlaying && <PauseCircle size={isMobile ? 30 : 50} color="white" />}
                    </div>

                    {!radioMode && (
                        <div onClick={nextButtonClicked}>
                            <SkipForward size={isMobile ? 20 : 30} color="rgb(220,220,220)" />
                        </div>
                    )}
                </div>

                <div className="flex flex-row flex-1 flex-shrink-0 gap-2 items-center justify-end">
                    <LucideVolume2 size={isMobile ? 20 : 30} />
                    <VolumeSlider style={{ width: isMobile ? 70 : 125 }} id="slider" onValueChange={volumeValueChanged} value={volumeValue} />
                </div>
            </div>

            <div className="flex flex-row gap-3 items-center">
                <span>{formatTime(currentTime)}</span>
                <AudioSlider
                    className="flex-1"
                    min={0}
                    max={maxTime}
                    step={1}
                    value={[currentTime]}
                    onValueChange={([v]) => currentTimeValueChanged(clamp(v, 0, maxTime))}
                />
                <span>{formatTime(maxTime)}</span>
            </div>
        </div>
    );
}
