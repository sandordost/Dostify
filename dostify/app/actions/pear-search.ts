"use server";

import { extractSongsPageFromPearSearch } from "@/lib/pear/extract-songs";
import type { Song } from "@/lib/types/song";
import type { PearSearchBody, PearSearchResponse } from "@/lib/types/pear-search";
import { getPearApiUrlServer } from "@/lib/pear/pear-config.server";

export async function pearSearchRawAction(body: PearSearchBody): Promise<PearSearchResponse> {
    const baseUrl = getPearApiUrlServer().replace(/\/+$/, "");

    const res = await fetch(`${baseUrl}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: body.query,
            params: body.params ?? "",
            continuation: body.continuation ?? "",
        }),
        cache: "no-store",
    });

    const text = await res.text();
    const data = (text ? JSON.parse(text) : {}) as PearSearchResponse;

    if (!res.ok) {
        throw new Error(`Pear /search failed (${res.status})`);
    }

    return data;
}

type PearSearchSongsOptions = {
    limit?: number;
    maxPages?: number;
};

export async function pearSearchSongsAction(
    body: PearSearchBody,
    opts: PearSearchSongsOptions = {}
): Promise<Song[]> {
    const limit = opts.limit ?? 30;
    const maxPages = opts.maxPages ?? 6;

    const seen = new Set<string>();
    const all: Song[] = [];

    let continuation = body.continuation ?? "";
    let page = 0;

    while (all.length < limit && page < maxPages) {
        const raw = await pearSearchRawAction({
            query: body.query,
            params: body.params ?? "",
            continuation,
        });

        const { songs, continuation: next } = extractSongsPageFromPearSearch(raw as any);

        for (const s of songs) {
            if (!s?.id || seen.has(s.id)) continue;
            seen.add(s.id);
            all.push(s);
            if (all.length >= limit) break;
        }

        if (!next) break;
        continuation = next;
        page++;
    }

    // extractor sorteert al op views desc, maar meerdere pagina’s kunnen dat verstoren
    all.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));

    return all.slice(0, limit);
}
