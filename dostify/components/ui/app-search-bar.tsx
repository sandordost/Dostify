"use client"

import { LucideSearch } from "lucide-react"
import { Input } from "./input"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { useState } from "react"
import { useRef } from "react"
import { ChangeEvent } from "react"
import Keyboard from "react-simple-keyboard"

type AppSearchBarProps = {
    value?: string;
    containerClassName?: string;
    isMobile?: boolean;
    searchTextChanged?: (updatedText: string) => void;
    radioMode?: boolean;
}

export default function AppSearchBar({ value, containerClassName, isMobile, searchTextChanged, radioMode }: AppSearchBarProps) {
    const [layoutName, setLayoutName] = useState<"default" | "shift" | "caps" | "capsShift">("default")
    const shiftReturnToRef = useRef<"default" | "caps">("default")
    const [showKeyboard, setShowKeyboard] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const keyboardRef = useRef<any>(null)
    const keyboardWrapRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (isMobile) setShowKeyboard(false);
    }, [isMobile]);

    function onKeyboardKeyPress(button: string) {
        if (button === "{enter}" || button === "{close}") {
            setShowKeyboard(false)
            inputRef.current?.blur()
            return
        }

        if (button === "{clear}") {
            searchTextChanged?.("");
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


    useEffect(() => {
        if (isMobile) return; // ✅ mobiel: laat OS keyboard met rust

        function onPointerDown(e: PointerEvent) {
            const path = (e.composedPath?.() ?? []) as EventTarget[];
            const inInput = path.includes(inputRef.current as any);
            const inKeyboard = path.includes(keyboardWrapRef.current as any);

            if (inInput || inKeyboard) return;
            setShowKeyboard(false);
        }

        document.addEventListener("pointerdown", onPointerDown, true);
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [isMobile]);

    function searchChanged(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value
        searchTextChanged?.(value)
        keyboardRef.current?.setInput?.(value)
    }

    function onKeyboardChange(input: string) {
        searchTextChanged?.(input)
        if (!isMobile) requestAnimationFrame(() => inputRef.current?.focus())
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

    return (
        <>
            <div className={cn(containerClassName, `flex flex-row items-center gap-3 py-2 pr-2 ${isMobile && !radioMode ? "order-2" : ""}`)}>
                <LucideSearch />
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={searchChanged}
                    onFocus={() => { if (!isMobile) setShowKeyboard(true) }}
                    onPointerDown={() => { if (isMobile) inputRef.current?.focus() }} // ✅ force focus on mobile
                    type="text"
                    className="h-10 m-0 border-none"
                    placeholder="Zoek muziek..."
                    autoComplete="off"
                    spellCheck={false}
                />
            </div>
            {/* On-screen keyboard (mobile only, fixed bottom) */}
            {!isMobile && showKeyboard && (
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
    );
}