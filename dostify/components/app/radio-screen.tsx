"use client"

import { cn } from "@/lib/utils";
import { useState } from "react";
import AppSearchBar from "../ui/app-search-bar";
import { searchStationsByName } from "@/app/actions/radio-search";
import { RadioStation } from "@/lib/types/radio-station";
import AudioItem from "../ui/audio-item";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect } from "react";
import { playRadioStationAction } from "@/app/actions/player";

type RadioScreenProps = {
    className?: string;
    isMobile?: boolean;
}

export default function RadioScreen({ className, isMobile }: RadioScreenProps) {
    const containerClassName = 'p-3 bg-[rgba(20,20,20,0.91)] rounded-md'
    const [searchText, setSearchText] = useState("");
    const [stations, setStations] = useState<RadioStation[]>([]);
    const debouncedSearch = useDebounce(searchText, 300)

    useEffect(() => {
        if (!debouncedSearch.trim()) {
            return
        }

        searchStationsByName(debouncedSearch).then(foundStations => {
            setStations(foundStations);
            console.log(foundStations);
        });
    }, [debouncedSearch])

    const stationClicked = async (station: RadioStation) => {
        await playRadioStationAction(station);
    }

    return (
        <div className={cn(className, `flex flex-col gap-3`)}>
            <AppSearchBar radioMode={true} isMobile={isMobile} containerClassName={containerClassName} searchTextChanged={setSearchText} value={searchText}/>
            <div className={cn(containerClassName, `flex-2 p-5 flex-col overflow-hidden`)}>
                <h1 className="text-xl font-bold mb-3">Zoekresultaten</h1>
                <div className="flex-1 h-full overflow-y-scroll">
                    <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] mb-10">
                        {stations.map(station => {
                            console.log(station.stationuuid);
                            return (
                                <AudioItem onClicked={() => stationClicked(station)} mode='result' className={"overflow-hidden"} imageSrc={station.favicon} key={station.stationuuid} title={station.name} description={station.country} />
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}