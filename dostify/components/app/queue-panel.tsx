"use client"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { ListMusic } from "lucide-react"
import AudioItem from "../ui/audio-item"
import type { Song } from "@/lib/types/song"
import { useMemo } from "react"

type QueuePanelProps = {
    queue: Song[]
    currentSong?: Song
    containerClassName: string
    className?: string
}

export default function QueuePanel({ queue, currentSong, containerClassName, className }: QueuePanelProps) {
    const displayQueue = useMemo(() => {
        if (!currentSong) return queue

        const same = (a: Song, b: Song) => {
            const aId = String(a.id ?? "")
            const bId = String(b.id ?? "")
            const aVid = String((a as any).videoId ?? "")
            const bVid = String((b as any).videoId ?? "")
            return (aId && bId && aId === bId) || (aVid && bVid && aVid === bVid)
        }

        // voorkom dubbele entry als current tóch al in queue zit
        const rest = queue.filter((s) => !same(s, currentSong))
        return [currentSong, ...rest]
    }, [queue, currentSong])

    return (
        <div className={cn(containerClassName, "flex flex-col h-full overflow-hidden", className)}>
            <div className="flex flex-row gap-3 text-[rgb(180,180,180)]">
                <ListMusic />
                <h2 className="text-md text-[rgb(180,180,180)]">Wachtrij</h2>
            </div>

            <Separator orientation="horizontal" className="my-2" />

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="flex flex-col gap-2">
                    {displayQueue.map((song, index) => (
                        <AudioItem
                            key={song.id ?? `${song.title}-${song.artist}-${index}`}
                            mode="queue"
                            title={song.title}
                            description={song.artist}
                            imageSrc={song.thumbnailUrl}
                            isActive={song.id === currentSong?.id}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
