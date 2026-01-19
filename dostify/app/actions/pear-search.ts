"use server";

import { extractSongsFromPearSearch } from "@/lib/pear/extract-songs";
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
        // throw zodat client het als error kan tonen
        throw new Error(`Pear /search failed (${res.status})`);
    }

    return data;
}

export async function pearSearchSongsAction(body: PearSearchBody): Promise<Song[]> {
    const raw = await pearSearchRawAction(body);
    return extractSongsFromPearSearch(raw as any);
}
