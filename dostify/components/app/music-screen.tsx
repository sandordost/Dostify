// music-screen.ts
"use client"

import { useDebounce } from "@/hooks/use-debounce"
import { usePearDesktop } from "@/hooks/use-pear-desktop"
import { useSongQueue } from "@/hooks/use-song-queue"
import { Song } from "@/lib/types/song"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import AudioItem from "../ui/audio-item"
import QueuePanel from "./queue-panel"
import { toast } from "sonner"
import AppSearchBar from "../ui/app-search-bar"
import { Skeleton } from "../ui/skeleton"

type MusicScreenProps = {
    className?: string;
    currentSong?: Song;
    isMobile?: boolean;
}

export default function MusicScreen({ className, currentSong, isMobile }: MusicScreenProps) {
    const containerClassName = "p-3 bg-[rgba(20,20,20,0.91)] rounded-md"

    const [songs, setSongs] = useState<Song[]>([])
    const [searchText, setSearchText] = useState<string>("")

    const [top50Songs, setTop50Songs] = useState<Song[]>([])
    const [top50Loading, setTop50Loading] = useState(false)

    const { searchSongs: searchYt, loading: songsLoading } = usePearDesktop()
    const { queue, addToQueue } = useSongQueue()
    const debouncedSearch = useDebounce(searchText, 300)

    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setSongs([])
            return
        }
        searchYt({ query: debouncedSearch }).then((songs) => setSongs(songs))
    }, [debouncedSearch, searchYt])

    const renderSongGrid = (list: Song[], loading: boolean) => {
        if (loading) {
            return (
                <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] mb-10">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <Skeleton className="h-60 w-45" style={{ opacity: `${100 - i * 8}%` }} key={i} />
                    ))}
                </div>
            )
        }

        return (
            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] mb-10">
                {list.map((song) => (
                    <AudioItem
                        key={song.url}
                        mode={isMobile ? "result-mobile" : "result"}
                        title={song.title}
                        imageSrc={song.thumbnailUrl}
                        description={song.artist}
                        viewsString={(song as any).viewsString}
                        onClicked={() => {
                            if (String(song.id).startsWith("missing:")) {
                                toast.error("Dit nummer kon niet automatisch gevonden worden.", { position: "top-center" })
                                return
                            }
                            addToQueue(song)
                            toast.success(`${song.title} toegevoegd aan wachtrij`, { position: "top-center" })
                        }}
                        className="overflow-hidden"
                    />
                ))}
            </div>
        )
    }

    return (
        <div className={cn(className, `flex ${isMobile ? "flex-col" : "flex-row"} gap-3`)}>
            <div className={`flex flex-col ${!isMobile && "flex-1"} gap-3`}>
                <AppSearchBar
                    isMobile={isMobile}
                    containerClassName={containerClassName}
                    searchTextChanged={txt => setSearchText(txt)}
                    value={searchText}
                />

                {!isMobile && <QueuePanel currentSong={currentSong} queue={queue} containerClassName={containerClassName} />}
            </div>

            {searchText === "" ? (
                <div className={cn(containerClassName, `flex-2 p-5 flex-col overflow-hidden`)}>
                    <h1 className="text-xl font-bold mb-3">538 Top 50 Nederland</h1>
                    <div className="flex-1 h-full overflow-y-scroll">
                        {renderSongGrid(top50Songs, top50Loading)}
                    </div>
                </div>
            ) : (
                <div className={cn(containerClassName, `flex-2 p-5 flex-col overflow-hidden`)}>
                    <h1 className="text-xl font-bold mb-3">Resultaten</h1>
                    <div className="flex-1 h-full overflow-y-scroll">
                        {renderSongGrid(songs, songsLoading)}
                    </div>
                </div>
            )}
        </div>
    )
}
