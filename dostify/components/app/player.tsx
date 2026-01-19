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

type PlayerProps = {
    className?: string;
};

export default function AppPlayer({ className }: PlayerProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const [maxTime, setMaxTime] = useState(180);
    const [volumeValue, setVolumeValue] = useState<number[]>([65]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | undefined>(undefined);

    const pollingRef = useRef<number | null>(null);
    const timeUntilNextSong = 3;

    async function refreshState() {
        const s = await getStateAction();
        setCurrentSong(s.song);
        setIsPlaying(s.isPlaying);
        setVolumeValue([Math.round(s.volume ?? 0)]);
        setCurrentTime(s.song?.elapsedTime || 0);
        setMaxTime(s.song?.songDuration || 0);
        return s;
    }

    async function playButtonPressed() {
        const r = await togglePlayAction();
        setIsPlaying(r.isPlaying);
    }

    async function previousButtonClicked() {
        const r = await prevSongAction();
        if (r.ok) {
            setCurrentSong(r.song);
            setIsPlaying(r.isPlaying);
            setCurrentTime(r.song?.elapsedTime || 0);
            setMaxTime(r.song?.songDuration || 0);
        }
    }

    async function nextButtonClicked() {
        const r = await nextSongAction();
        if (r.ok) {
            setCurrentSong(r.song);
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
                setCurrentTime(elapsed);
                setMaxTime(dur);
                setIsPlaying(s.isPlaying);

                if (dur > 0 && dur - elapsed <= timeUntilNextSong) {
                    await nextSongAction();
                }
            }, 500);
        })();

        return () => {
            cancelled = true;
            if (pollingRef.current) window.clearInterval(pollingRef.current);
        };
    }, []);

    return (
        <div className={cn(className, "bg-[rgba(0,0,0,0.96)] flex flex-col w-full rounded-t-xl")}>
            <div className="flex flex-row justify-around w-full">
                <AudioItem
                    className="flex-1 overflow-hidden"
                    title={currentSong?.title || "Unknown"}
                    description={currentSong?.artist}
                    imageSrc={currentSong?.thumbnailUrl}
                    mode="player"
                />

                <div className="flex flex-row gap-4 flex-1 items-center justify-center">
                    <div onClick={previousButtonClicked}>
                        <SkipBack size={30} color="rgb(220,220,220)" />
                    </div>

                    <div onClick={playButtonPressed}>
                        {!isPlaying && <PlayCircle size={50} color="white" />}
                        {isPlaying && <PauseCircle size={50} color="white" />}
                    </div>

                    <div onClick={nextButtonClicked}>
                        <SkipForward size={30} color="rgb(220,220,220)" />
                    </div>
                </div>

                <div className="flex flex-row flex-1 flex-shrink-0 gap-2 items-center justify-end">
                    <LucideVolume2 size={30} />
                    <Slider className="w-30" id="slider" onValueChange={volumeValueChanged} value={volumeValue} />
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
