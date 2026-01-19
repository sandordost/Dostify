
import type { Song } from "@/lib/types/song";

type AnyObj = Record<string, any>;

function getRunsText(runs?: any[]): string {
    if (!Array.isArray(runs)) return "";
    return runs.map(r => r?.text).filter(Boolean).join("");
}

function pickBestThumbnail(thumbnails?: any[]): string {
    if (!Array.isArray(thumbnails) || thumbnails.length === 0) return "";
    const best = thumbnails.reduce((a, b) => {
        const aScore = (a?.width ?? 0) * (a?.height ?? 0);
        const bScore = (b?.width ?? 0) * (b?.height ?? 0);
        return bScore > aScore ? b : a;
    });
    return best?.url ?? "";
}

function getVideoId(r: AnyObj): string {
    return (
        r?.playlistItemData?.videoId ??
        r?.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
            ?.watchEndpoint?.videoId ??
        ""
    );
}

function getFlexText(r: AnyObj, index: number): string {
    const text = r?.flexColumns?.[index]?.musicResponsiveListItemFlexColumnRenderer?.text;
    if (!text) return "";
    if (typeof text.simpleText === "string") return text.simpleText;
    return getRunsText(text.runs);
}

export function extractSongsFromPearSearch(response: AnyObj): Song[] {
    const renderers: AnyObj[] = [];

    const walk = (node: any) => {
        if (!node || typeof node !== "object") return;

        const r = node.musicResponsiveListItemRenderer;
        if (r && typeof r === "object") renderers.push(r);

        for (const v of Object.values(node)) {
            if (Array.isArray(v)) v.forEach(walk);
            else walk(v);
        }
    };

    walk(response);

    const byId = new Map<string, Song>();

    for (const r of renderers) {
        const videoId = getVideoId(r);
        if (!videoId) continue;

        const thumbs =
            r?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails ??
            r?.thumbnail?.musicThumbnailRenderer?.thumbnails ??
            [];

        const song: Song = {
            id: videoId,
            service: 'yt-music',
            url: `https://music.youtube.com/watch?v=${videoId}`,
            title: getFlexText(r, 0).trim() || "Unknown title",
            artist: getFlexText(r, 1).trim() || "Unknown artist",
            thumbnailUrl: pickBestThumbnail(thumbs),
            elapsedTime: 0,
            songDuration: 0
        };

        if (!byId.has(videoId)) byId.set(videoId, song);
    }

    return Array.from(byId.values());
}
