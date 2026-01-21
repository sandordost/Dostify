"use client"

import { AppHeader } from "@/components/app/header";
import AppMain from "@/components/app/main";
import AppPlayer from "@/components/app/app-player";
import { useIsMobile } from "@/hooks/use-mobile";
import SwipePlayerSheet from "@/components/app/swipe-player-sheet";
import { useState } from "react";
import { Song } from "@/lib/types/song";
import { usePlayer } from "@/hooks/use-player";
import PageBackground from "@/components/page-background";

export default function Home() {
  const isMobile = useIsMobile();
  const containerClassName = 'p-3 bg-[rgba(20,20,20,0.91)] rounded-md'
  const [currentSong, setCurrentSong] = useState<Song | undefined>(undefined)
  const { playerType } = usePlayer();
  const radioMode = playerType == 'Radio'

  return (
    <>
      <PageBackground radioMode={radioMode} />
      <div className="flex flex-col h-screen min-h-0">
        <AppHeader radioMode={radioMode} className="w-full p-3 flex-none" />

        <AppMain isMobile={isMobile} radioMode={radioMode} currentSong={currentSong} className={`px-2 flex-1 min-h-0 overflow-y-scroll pb-2 pb-${isMobile ?? "[140px]"}`} />

        {isMobile && !radioMode ? (
          <SwipePlayerSheet radioMode={radioMode} currentSong={currentSong} containerClassName={containerClassName} collapsedHeight={135} expandedHeightVh={65} />
        ) : (
          <AppPlayer radioMode={radioMode} onSongChange={setCurrentSong} className="pb-2" />
        )}
      </div>
    </>
  );
}