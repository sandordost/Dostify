"use client"

import React, { createContext, useContext, useMemo, useState } from "react"

type GlobalState = {
    radioMode: boolean
    setRadioMode: (v: boolean) => void
    toggleRadioMode: () => void
}

const GlobalStateContext = createContext<GlobalState | null>(null)

export function GlobalStateProvider({ children }: { children: React.ReactNode }) {
    const [radioMode, setRadioMode] = useState(false)

    const value = useMemo(
        () => ({
            radioMode,
            setRadioMode,
            toggleRadioMode: () => setRadioMode(v => !v),
        }),
        [radioMode]
    )

    return (
        <GlobalStateContext.Provider value={value}>
            {children}
        </GlobalStateContext.Provider>
    )
}

export function useGlobalState() {
    const ctx = useContext(GlobalStateContext)
    if (!ctx) throw new Error("useGlobalState must be used inside GlobalStateProvider")
    return ctx
}
