"use client"

import { useDebounce } from "@/hooks/use-debounce"
import { useIsMobile } from "@/hooks/use-mobile"
import { usePearDesktop } from "@/hooks/use-pear-desktop"
import { useSongQueue } from "@/hooks/use-song-queue"
import { Song } from "@/lib/types/song"
import { cn } from "@/lib/utils"
import { LucideSearch } from "lucide-react"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { Input } from "../ui/input"
import AudioItem from "../ui/audio-item"
import QueuePanel from "./queue-panel"
import { toast } from "sonner"
import Keyboard from "react-simple-keyboard"

type MusicScreenProps = {
    className?: string
    currentSong?: Song
}

export default function MusicScreen({ className, currentSong }: MusicScreenProps) {
    const containerClassName = "p-3 bg-[rgba(20,20,20,0.91)] rounded-md"

    const [searchText, setSearchText] = useState("")
    const [songs, setSongs] = useState<Song[]>([])
    const [showKeyboard, setShowKeyboard] = useState(false)

    const inputRef = useRef<HTMLInputElement | null>(null)
    const keyboardRef = useRef<any>(null)
    const keyboardWrapRef = useRef<HTMLDivElement | null>(null)

    const { searchSongs: searchYt } = usePearDesktop()
    const { queue, addToQueue } = useSongQueue()
    const debouncedSearch = useDebounce(searchText, 300)
    const isMobile = useIsMobile()
    const [layoutName, setLayoutName] = useState<"default" | "shift" | "caps" | "capsShift">("default")
    const shiftReturnToRef = useRef<"default" | "caps">("default")

    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setSongs([])
            return
        }
        searchYt({ query: debouncedSearch }).then((songs) => setSongs(songs))
    }, [debouncedSearch, searchYt])

    useEffect(() => {
        function onPointerDown(e: PointerEvent) {
            const path = (e.composedPath?.() ?? []) as EventTarget[]
            const inInput = path.includes(inputRef.current as any)
            const inKeyboard = path.includes(keyboardWrapRef.current as any)

            if (inInput || inKeyboard) return
            setShowKeyboard(false)
        }

        document.addEventListener("pointerdown", onPointerDown, true) // capture!
        return () => document.removeEventListener("pointerdown", onPointerDown, true)
    }, [])

    function searchChanged(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value
        setSearchText(value)
        keyboardRef.current?.setInput?.(value)
    }

    function onKeyboardChange(input: string) {
        setSearchText(input)
        // zorg dat cursor blijft werken: focus input
        requestAnimationFrame(() => inputRef.current?.focus())
    }

    function armShift() {
        setLayoutName((prev) => {
            // shiftReturnTo = waar we straks naar terug moeten
            shiftReturnToRef.current = prev === "caps" || prev === "capsShift" ? "caps" : "default"

            // shift layout kiezen afhankelijk van caps
            return prev === "caps" || prev === "capsShift" ? "capsShift" : "shift"
        })
    }

    function maybeReturnFromShift(button: string) {
        const special = new Set(["{shift}", "{lock}", "{bksp}", "{enter}", "{close}", "{clear}", "{space}"])
        if (special.has(button)) return

        setLayoutName((prev) => {
            if (prev !== "shift" && prev !== "capsShift") return prev
            return shiftReturnToRef.current
        })
    }

    function toggleCaps() {
        setLayoutName((prev) => {
            if (prev === "caps" || prev === "capsShift") return "default"
            return "caps"
        })
    }

    function onKeyboardKeyPress(button: string) {
        if (button === "{enter}" || button === "{close}") {
            setShowKeyboard(false)
            inputRef.current?.blur()
            return
        }

        if (button === "{clear}") {
            setSearchText("")
            keyboardRef.current?.setInput?.("")
            return
        }

        if (button === "{lock}") {
            toggleCaps()
            return
        }

        if (button === "{shift}") {
            armShift()
            return
        }

        maybeReturnFromShift(button)
    }



    return (
        <>
            <div className={cn(className, `flex ${isMobile ? "flex-col" : "flex-row"} gap-3`)}>
                <div className={`flex flex-col ${!isMobile && "flex-1"} gap-3`}>
                    {/* Search Bar */}
                    <div className={cn(containerClassName, `flex flex-row items-center gap-3 py-2 pr-2 ${isMobile ? "order-2" : ""}`)}>
                        <LucideSearch />
                        <Input
                            ref={inputRef}
                            value={searchText}
                            onChange={searchChanged}
                            onFocus={() => setShowKeyboard(true)}
                            type="text"
                            className="h-10 m-0 border-none"
                            placeholder="Zoek muziek..."
                            inputMode="none" // voorkomt OS keyboard als je jouw eigen keyboard wil
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>

                    {/* Queue */}
                    {!isMobile && <QueuePanel currentSong={currentSong} queue={queue} containerClassName={containerClassName} />}
                </div>

                {/* Right Side */}
                <div className={cn(containerClassName, `flex-2 p-5 flex-col overflow-hidden`)}>
                    <h1 className="text-xl font-bold mb-3">Resultaten</h1>
                    <div className="flex-1 h-full overflow-y-scroll">
                        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] mb-10">
                            {songs.map((song) => (
                                <AudioItem
                                    key={song.url}
                                    mode={isMobile ? "result-mobile" : "result"}
                                    title={song.title}
                                    imageSrc={song.thumbnailUrl}
                                    description={song.artist}
                                    onClicked={() => {
                                        addToQueue(song)
                                        toast.success(`${song.title} toegevoegd aan wachtrij`, { position: "top-center" })
                                    }}
                                    className="overflow-hidden"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* On-screen keyboard (mobile only, fixed bottom) */}
            {showKeyboard && (
                <div
                    ref={keyboardWrapRef}
                    className="fixed inset-x-0 bottom-[10vh] z-[999] p-2 w-[90vw] left-[5vw]"
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <Keyboard
                        keyboardRef={(r) => (keyboardRef.current = r)}
                        onChange={onKeyboardChange}
                        onKeyPress={onKeyboardKeyPress}
                        layoutName={layoutName}
                        layout={{
                            default: [
                                "1 2 3 4 5 6 7 8 9 0",
                                "q w e r t y u i o p",
                                "{lock} a s d f g h j k l",
                                "{shift} z x c v b n m {bksp}",
                                "{clear} {space} {enter} {close}",
                            ],
                            shift: [
                                "! @ # $ % ^ & * ( )",
                                "Q W E R T Y U I O P",
                                "{lock} A S D F G H J K L",
                                "{shift} Z X C V B N M {bksp}",
                                "{clear} {space} {enter} {close}",
                            ],
                            caps: [
                                "1 2 3 4 5 6 7 8 9 0",
                                "Q W E R T Y U I O P",
                                "{lock} A S D F G H J K L",
                                "{shift} Z X C V B N M {bksp}",
                                "{clear} {space} {enter} {close}",
                            ],
                            capsShift: [
                                "! @ # $ % ^ & * ( )",
                                "q w e r t y u i o p",
                                "{lock} a s d f g h j k l",
                                "{shift} z x c v b n m {bksp}",
                                "{clear} {space} {enter} {close}",
                            ],
                        }}
                        display={{
                            "{bksp}": "⌫",
                            "{enter}": "Done",
                            "{shift}": "⇧",
                            "{lock}": "Caps",
                            "{space}": "Space",
                            "{clear}": "Clear",
                            "{close}": "Close",
                        }}
                    />

                </div>
            )}
        </>
    )
}
