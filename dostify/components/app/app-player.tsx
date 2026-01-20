"use client";

import { clamp, cn, formatTime } from "@/lib/utils";
import AudioItem from "../ui/audio-item";
import { Slider } from "@/components/ui/slider";
import { useEffect, useRef, useState } from "react";
import { LucideVolume2, PlayCircle, SkipForward, SkipBack, PauseCircle } from "lucide-react";
import { AudioSlider } from "../ui/audio-slider";
import type { Song } from "@/lib/types/song";

import {
    togglePlayAction,
    nextSongAction,
    prevSongAction,
    getStateAction,
    setVolumeAction,
    seekAction,
} from "@/app/actions/player";
import { useIsMobile } from "@/hooks/use-mobile";

type PlayerProps = {
    className?: string;
    onSongChange?: (song?: Song) => void;
};

export default function AppPlayer({ className, onSongChange }: PlayerProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const [maxTime, setMaxTime] = useState(180);
    const [volumeValue, setVolumeValue] = useState<number[]>([65]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | undefined>(undefined);

    const isMobile = useIsMobile();

    const pollingRef = useRef<number | null>(null);
    const timeUntilNextSong = 3;

    async function refreshState() {
        const s = await getStateAction();
        setCurrentSong(s.song);
        emitSongChange(s.song);
        setIsPlaying(s.isPlaying);
        setVolumeValue([Math.round(s.volume ?? 0)]);
        setCurrentTime(s.song?.elapsedTime || 0);
        setMaxTime(s.song?.songDuration || 0);
        return s;
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
        setIsPlaying(r.isPlaying);
    }

    async function previousButtonClicked() {
        const r = await prevSongAction();
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
        await seekAction(seconds);
    }

    async function volumeValueChanged(volume: number[]) {
        setVolumeValue(volume);
        await setVolumeAction(volume[0]);
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (cancelled) return;
            await refreshState();

            pollingRef.current = window.setInterval(async () => {
                const s = await getStateAction();

                const elapsed = s.song?.elapsedTime || 0;
                const dur = s.song?.songDuration || 0;

                setCurrentSong(s.song);
                emitSongChange(s.song);
                setCurrentTime(elapsed);
                setMaxTime(dur);
                setIsPlaying(s.isPlaying);

                if (dur > 0 && dur - elapsed <= timeUntilNextSong) {
                    const r = await nextSongAction();
                    if (r.ok) {
                        emitSongChange(r.song);
                    }
                }
            }, 500);
        })();

        return () => {
            cancelled = true;
            if (pollingRef.current) window.clearInterval(pollingRef.current);
        };
    }, []);

    return (
        <div className={cn(className, "px-4 bg-[rgba(0,0,0,0.96)] flex flex-col w-full rounded-t-xl")}>
            <div className="flex flex-row justify-around w-full">
                <AudioItem
                    className="flex-1 overflow-hidden"
                    title={currentSong?.title || "Unknown"}
                    description={currentSong?.artist}
                    imageSrc={currentSong?.thumbnailUrl}
                    mode="player"
                    isMobile={isMobile}
                />

                <div className="flex flex-row gap-4 flex-1 items-center justify-center">
                    <div onClick={previousButtonClicked}>
                        <SkipBack size={isMobile ? 20 : 30} color="rgb(220,220,220)" />
                    </div>

                    <div onClick={playButtonPressed}>
                        {!isPlaying && <PlayCircle size={isMobile ? 30 : 50} color="white" />}
                        {isPlaying && <PauseCircle size={isMobile ? 30 : 50} color="white" />}
                    </div>

                    <div onClick={nextButtonClicked}>
                        <SkipForward size={isMobile ? 20 : 30} color="rgb(220,220,220)" />
                    </div>
                </div>

                <div className="flex flex-row flex-1 flex-shrink-0 gap-2 items-center justify-end">
                    <LucideVolume2 size={isMobile ? 20 : 30} />
                    <Slider style={{ width: isMobile ? 70 : 125 }} id="slider" onValueChange={volumeValueChanged} value={volumeValue} />
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
