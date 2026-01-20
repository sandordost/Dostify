"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import AppPlayer from "@/components/app/app-player"
import QueuePanel from "@/components/app/queue-panel"
import { useSongQueue } from "@/hooks/use-song-queue"
import { Song } from "@/lib/types/song"

type SwipePlayerSheetProps = {
    className?: string
    containerClassName: string
    collapsedHeight?: number
    expandedHeightVh?: number
    onSongChange?: (song?: Song) => void;
    currentSong?: Song
}

export default function SwipePlayerSheet({
    className,
    containerClassName,
    collapsedHeight = 118,
    expandedHeightVh = 85,
    onSongChange,
    currentSong,
}: SwipePlayerSheetProps) {
    const { queue } = useSongQueue()
    const [expanded, setExpanded] = React.useState(false)

    const start = React.useRef<{ x: number; y: number } | null>(null)
    const last = React.useRef<{ x: number; y: number } | null>(null)
    const dragging = React.useRef(false)
    const lockedAxis = React.useRef<"v" | "h" | null>(null)

    const axisLockThreshold = 8
    const swipeThreshold = 45

    function reset() {
        dragging.current = false
        start.current = null
        last.current = null
        lockedAxis.current = null
    }

    function onPointerDown(e: React.PointerEvent) {
        dragging.current = true
        lockedAxis.current = null
        start.current = { x: e.clientX, y: e.clientY }
        last.current = { x: e.clientX, y: e.clientY }
            ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!dragging.current) return
        last.current = { x: e.clientX, y: e.clientY }

        const s = start.current
        if (!s) return

        if (!lockedAxis.current) {
            const dx = e.clientX - s.x
            const dy = e.clientY - s.y
            if (Math.abs(dx) < axisLockThreshold && Math.abs(dy) < axisLockThreshold) return
            lockedAxis.current = Math.abs(dy) >= Math.abs(dx) ? "v" : "h"
        }
    }

    function finishSwipe() {
        const s = start.current
        const l = last.current
        const axis = lockedAxis.current
        reset()

        if (!s || !l) return
        if (axis !== "v") return

        const deltaY = l.y - s.y
        if (deltaY < -swipeThreshold) setExpanded(true)
        if (deltaY > swipeThreshold) setExpanded(false)
    }

    const heightStyle = expanded ? `${expandedHeightVh}vh` : `${collapsedHeight}px`

    return (
        <div
            className={cn(
                "fixed inset-x-0 bottom-0 z-50",
                "transition-[height] duration-250 ease-out",
                className
            )}
            style={{ height: heightStyle }}
        >
            {/* Swipe-capture layer: dit pakt alle gestures */}
            <div
                className={cn(
                    "h-full w-full rounded-t-xl bg-[rgba(0,0,0,0.96)] shadow-2xl flex flex-col overflow-hidden",
                    "touch-none",                 // <- KEY (touch-action: none)
                    "overscroll-contain"          // <- voorkomt browser overscroll
                )}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={finishSwipe}
                onPointerCancel={reset}
            >
                <div className="px-4 pt-3">
                    <AppPlayer onSongChange={onSongChange} />
                </div>

                <div
                    className={cn(
                        "px-3 pb-3 pt-3 flex-1 min-h-0 transition-opacity duration-200",
                        expanded ? "opacity-100" : "opacity-0"
                    )}
                    style={{ pointerEvents: expanded ? "auto" : "none" }}
                >
                    {/* Queue mag scrollen; daarom geven we het scrollgebied z’n eigen touch-action */}
                    <div className="h-full min-h-0 touch-pan-y">
                        <QueuePanel
                            queue={queue}
                            containerClassName={containerClassName}
                            className="h-full min-h-0"
                            currentSong={currentSong}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
