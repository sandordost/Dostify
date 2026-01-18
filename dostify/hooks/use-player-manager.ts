"use client"

import PlayerManager from "@/lib/types/player-manager"
import { useState } from "react"

export function usePlayerManager() {
    const [playerManager, setPlayerManager] = useState<PlayerManager>(new PlayerManager());

    return { playerManager }
}