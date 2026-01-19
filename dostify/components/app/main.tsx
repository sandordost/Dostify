"use client"

import { cn } from "@/lib/utils";
import AudioItem from "../ui/audio-item";
import { Input } from "../ui/input";
import { LucideSearch, ListMusic } from "lucide-react";
import { Separator } from "../ui/separator";
import { ChangeEvent, useEffect, useState } from "react";
import { usePearDesktop } from "@/hooks/use-pear-desktop";
import { Song } from "@/lib/types/song";
import { useDebounce } from "@/hooks/use-debounce";
import { useSongQueue } from "@/hooks/use-song-queue";
import { useGlobalState } from "../global-state";

type MainProps = {
    className?: string
}

export default function AppMain({ className }: MainProps) {
    const containerClassName = 'p-3 bg-[rgba(33,33,33,0.73)] rounded-md'
    const [searchText, setSearchText] = useState("");
    const { searchSongs: searchYt } = usePearDesktop();
    const [songs, setSongs] = useState<Song[]>([])
    const { queue, addToQueue } = useSongQueue();
    const { radioMode } = useGlobalState();

    const debouncedSearch = useDebounce(searchText, 300);

    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setSongs([]);
            return;
        }

        searchYt({ query: debouncedSearch }).then((songs) => {
            setSongs(songs);
        });
    }, [debouncedSearch, searchYt]);

    function searchChanged(event: ChangeEvent<HTMLInputElement>): void {
        setSearchText(event.target.value)
    }

    return (
        <div className={cn(className, 'flex flex-row gap-3')}>

            {/* Left Side */}
            <div className="flex flex-col flex-1 gap-3">
                {/* Search Bar */}
                <div className={cn(containerClassName, 'flex flex-row items-center gap-3 py-2 pr-2')}>
                    <LucideSearch />
                    <Input onChange={searchChanged} type={'text'} style={{ background: 'none' }} className="h-10 m-0 border-none" />
                </div>

                { /* Queue */}
                {!radioMode && (
                    <div className={cn(containerClassName, 'flex-grow flex flex-col overflow-hidden')}>
                        <div className="flex flex-row gap-3 text-[rgb(180,180,180)]">
                            <ListMusic />
                            <h2 className="text-md text-[rgb(180,180,180)]">Wachtrij</h2>
                        </div>
                        <Separator orientation="horizontal" color="rgb(180,180,180)" className="my-2" />
                        <div className="flex-1 h-full w-full overflow-y-scroll overflow-x-hidden">
                            <div className="flex flex-col gap-2">
                                {queue.map(song => (
                                    <AudioItem mode='queue' title={song.title} description={song.artist} imageSrc={song.thumbnailUrl} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className={cn(containerClassName, 'flex-2 p-5 flex-col overflow-hidden')}>
                <h1 className="text-xl font-bold mb-3">Resultaten</h1>
                <div className="flex-1 h-full overflow-y-scroll">
                    <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] mb-10">
                        {songs.map((song) => (
                            <AudioItem
                                key={song.url}
                                mode="result"
                                title={song.title}
                                imageSrc={song.thumbnailUrl}
                                description={song.artist}
                                onClicked={() => { addToQueue(song) }}
                                className="overflow-hidden"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}