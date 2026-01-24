"use client"

import { Song } from "@/lib/types/song";
import MusicScreen from "./music-screen";
import RadioScreen from "./radio-screen";

type MainProps = {
    className?: string;
    currentSong?: Song;
    radioMode: boolean;
    isMobile?: boolean;
}

export default function AppMain({ className, currentSong, radioMode, isMobile }: MainProps) {

    return radioMode ?
        <RadioScreen isMobile={isMobile} className={className} /> :
        <MusicScreen isMobile={isMobile} currentSong={currentSong} className={className} />
}