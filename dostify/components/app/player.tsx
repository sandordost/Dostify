"use client"

import { clamp, cn, formatTime, sleep } from "@/lib/utils";
import AudioItem from "../ui/audio-item";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { LucideVolume2, PlayCircle, SkipForward, SkipBack, PauseCircle } from "lucide-react";
import { AudioSlider } from "../ui/audio-slider";
import { usePlayerManager } from "@/hooks/use-player-manager";
import { Song } from "@/lib/types/song";

type PlayerProps = {
    className?: string
}

export default function AppPlayer({ className }: PlayerProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const [maxTime, setMaxTime] = useState(180);
    const [volumeValue, setVolumeValue] = useState([65]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentSong, setCurrentSong] = useState<Song | undefined>(undefined)
    const { playerManager } = usePlayerManager();

    playerManager.currentPlayer?.IsPlaying().then(playing => {
        setIsPlaying(playing);
    })

    async function playButtonPressed() {
        await playerManager.TogglePlay();

        await sleep(150);

        playerManager.currentPlayer?.IsPlaying().then(playing => {
            setIsPlaying(playing);
        })
    }

    async function previousButtonClicked() {
        await playerManager.PlayNextSong();
    }

    async function nextButtonClicked() {
        await playerManager.PlayNextSong();
    }

    async function currentTimeValueChanged(seconds: number) {
        setCurrentTime(seconds);
        await playerManager.currentPlayer?.SetPlaybackTime(seconds);
    }

    async function volumeValueChanged(volume: number[]) {
        setVolumeValue(volume);
        await playerManager.currentPlayer?.SetVolumePercent(volume[0])
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            const song = await playerManager.currentPlayer?.GetCurrentSong()
            setCurrentSong(song);
            console.log(song?.elapsedTime);
            setCurrentTime(song?.elapsedTime || 0)
            setMaxTime(song?.songDuration || 0)
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn(className, 'bg-[rgba(0,0,0,0.96)] flex flex-col w-full rounded-t-xl')}>
            <div className="flex flex-row justify-around w-full">
                <AudioItem className="flex-1 overflow-hidden" title={currentSong?.title || 'Unknown'} description={currentSong?.artist} imageSrc={currentSong?.thumbnailUrl} mode="player" />
                <div className="flex flex-row gap-4 flex-1 items-center justify-center">
                    <div onClick={previousButtonClicked}>
                        <SkipBack size={30} color="rgb(220,220,220)" />
                    </div>
                    <div onClick={playButtonPressed} >
                        {!isPlaying && (
                            <PlayCircle size={50} color="white" />
                        )}
                        {isPlaying && (
                            <PauseCircle size={50} color="white" />
                        )}
                    </div>
                    <div onClick={nextButtonClicked}>
                        <SkipForward size={30} color="rgb(220,220,220)" />
                    </div>
                </div>
                <div className="flex flex-row flex-1 flex-shrink-0 gap-2 items-center justify-end">
                    <LucideVolume2 size="30" />
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