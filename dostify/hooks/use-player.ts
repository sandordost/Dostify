"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPlayerType } from "@/app/actions/player";
import { PlayerType } from "@/lib/types/players/player-type";

export function usePlayer() {
    const pollingRef = useRef<number | null>(null);
    const [playerType, setPlayerType] = useState<PlayerType | undefined>(undefined)

    const refresh = useCallback(async () => {
        const pt = await getPlayerType();
        setPlayerType(pt);
    }, []);

    useEffect(() => {
        refresh();

        pollingRef.current = window.setInterval(() => {
            refresh();
        }, 1000);

        return () => {
            if (pollingRef.current) window.clearInterval(pollingRef.current);
        };
    }, [refresh]);

    return { playerType, refresh };
}
