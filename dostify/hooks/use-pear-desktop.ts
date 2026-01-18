"use client";

import * as React from "react";
import { getPearApiUrl } from "./use-config"; // pas aan naar jouw pad
import { extractSongsFromPearSearch } from "@/lib/pear/extract-songs";
import type { Song } from "@/lib/types/song";

export type PearSearchBody = {
    query: string;
    params?: string;
    continuation?: string;
};

export type PearSearchResponse = Record<string, unknown>;

type PearError = {
    message: string;
    status?: number;
    details?: unknown;
};

export function usePearDesktop() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<PearError | null>(null);
    const [lastResponse, setLastResponse] = React.useState<PearSearchResponse | null>(null);

    const abortRef = React.useRef<AbortController | null>(null);
    const baseUrl = getPearApiUrl().replace(/\/+$/, "");

    const searchRaw = React.useCallback(async (body: PearSearchBody) => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${baseUrl}/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: body.query,
                    params: body.params ?? "",
                    continuation: body.continuation ?? "",
                }),
                signal: ac.signal,
            });

            const text = await res.text();
            const data = text ? (JSON.parse(text) as PearSearchResponse) : {};

            if (!res.ok) {
                setError({
                    message: `Pear /search failed (${res.status})`,
                    status: res.status,
                    details: data,
                });
                setLoading(false);
                return null;
            }

            setLastResponse(data);
            setLoading(false);
            return data;
        } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") {
                setLoading(false);
                return null;
            }

            setError({ message: e instanceof Error ? e.message : "Unknown error", details: e });
            setLoading(false);
            return null;
        }
    }, []);

    const searchSongs = React.useCallback(async (body: PearSearchBody): Promise<Song[]> => {
        const res = await searchRaw(body);
        if (!res) return [];
        return extractSongsFromPearSearch(res as any);
    }, [searchRaw]);

    const cancel = React.useCallback(() => {
        abortRef.current?.abort();
    }, []);

    return { searchRaw, searchSongs, cancel, loading, error, lastResponse };
}
