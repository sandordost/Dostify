"use client"

import { Song } from "@/lib/types/song";
import { useGlobalState } from "../global-state";
import MusicScreen from "./music-screen";
import RadioScreen from "./radio-screen";

type MainProps = {
    className?: string
    currentSong?: Song
}

export default function AppMain({ className, currentSong }: MainProps) {
    const { radioMode } = useGlobalState();

    return radioMode ?
        <RadioScreen className={className} /> :
        <MusicScreen currentSong={currentSong} className={className} />
}