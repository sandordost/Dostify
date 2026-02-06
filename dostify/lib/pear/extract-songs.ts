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
        r?.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
            ?.playNavigationEndpoint?.watchEndpoint?.videoId ??
        ""
    );
}

function getFlexTextRaw(r: AnyObj, index: number): string {
    const text = r?.flexColumns?.[index]?.musicResponsiveListItemFlexColumnRenderer?.text;
    if (!text) return "";
    if (typeof text.simpleText === "string") return text.simpleText;
    return getRunsText(text.runs);
}

function parseNlCount(text: string): number | null {
    if (!text) return null;
    const t = text.replace(/\u00A0/g, " ").toLowerCase();

    const m = t.match(/([\d.,]+)\s*(mld\.|mln\.|k)?/);
    if (!m) return null;

    const raw = m[1].replace(/\./g, "").replace(",", ".");
    const base = Number(raw);
    if (!Number.isFinite(base)) return null;

    const mult =
        m[2] === "mld." ? 1e9 :
            m[2] === "mln." ? 1e6 :
                m[2] === "k" ? 1e3 :
                    1;

    return base * mult;
}

function getViewsString(r: AnyObj): string {
    const cols = r?.flexColumns ?? [];
    for (let i = cols.length - 1; i >= 0; i--) {
        const txt = getFlexTextRaw(r, i);
        if (!txt) continue;
        if (txt.toLowerCase().includes("keer afgespeeld")) {
            return txt.replace(" keer afgespeeld", "") ?? 0;
        }
    }
    return "";
}

function getViewsNumber(r: AnyObj): number {
    const cols = r?.flexColumns ?? [];
    for (let i = cols.length - 1; i >= 0; i--) {
        const txt = getFlexTextRaw(r, i);
        if (!txt) continue;
        if (txt.toLowerCase().includes("keer afgespeeld")) {
            return parseNlCount(txt) ?? 0;
        }
    }
    return 0;
}

function parseDurationToSeconds(text: string): number {
    if (!text) return 0;
    const m = text.match(/(\d{1,2}:)?\d{1,2}:\d{2}/);
    if (!m) return 0;

    const parts = m[0].split(":").map(x => Number(x));
    if (parts.some(n => !Number.isFinite(n))) return 0;

    if (parts.length === 2) {
        const [mm, ss] = parts;
        return mm * 60 + ss;
    }

    const [hh, mm, ss] = parts;
    return hh * 3600 + mm * 60 + ss;
}

function getSongDurationSeconds(r: AnyObj): number {
    const cols = r?.flexColumns ?? [];
    for (let i = 0; i < cols.length; i++) {
        const txt = getFlexTextRaw(r, i);
        const secs = parseDurationToSeconds(txt);
        if (secs > 0) return secs;
    }
    return 0;
}

function getArtistsFromFlex(r: AnyObj): string {
    const runs = r?.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs ?? [];
    const artists = runs
        .filter((x: any) =>
            x?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
                ?.browseEndpointContextMusicConfig?.pageType === "MUSIC_PAGE_TYPE_ARTIST"
        )
        .map((x: any) => x.text)
        .filter(Boolean);

    return artists.join(", ");
}

function getMusicSearchRoot(response: AnyObj): any {
    const tabs = response?.contents?.tabbedSearchResultsRenderer?.tabs ?? [];
    const musicTab = tabs.find((t: any) => t?.tabRenderer?.tabIdentifier === "music_search_catalog")?.tabRenderer;
    return musicTab?.content ?? response;
}

function extractContinuationToken(node: any): string | undefined {
    let found: string | undefined;

    const walk = (n: any) => {
        if (!n || typeof n !== "object" || found) return;

        const next = n?.nextContinuationData?.continuation;
        if (typeof next === "string" && next.length > 0) {
            found = next;
            return;
        }

        const reload = n?.reloadContinuationData?.continuation;
        if (typeof reload === "string" && reload.length > 0) {
            found = reload;
            return;
        }

        for (const v of Object.values(n)) {
            if (Array.isArray(v)) v.forEach(walk);
            else walk(v);
        }
    };

    walk(node);
    return found;
}

export function extractSongsPageFromPearSearch(response: AnyObj): { songs: Song[]; continuation?: string } {
    const root = getMusicSearchRoot(response);

    const renderers: AnyObj[] = [];
    const walk = (n: any) => {
        if (!n || typeof n !== "object") return;

        const r = n.musicResponsiveListItemRenderer;
        if (r && typeof r === "object") renderers.push(r);

        for (const v of Object.values(n)) {
            if (Array.isArray(v)) v.forEach(walk);
            else walk(v);
        }
    };

    walk(root);

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
            service: "yt-music",
            url: `https://music.youtube.com/watch?v=${videoId}`,
            title: getFlexTextRaw(r, 0).trim() || "Unknown title",
            artist: getArtistsFromFlex(r) || "Unknown artist",
            thumbnailUrl: pickBestThumbnail(thumbs),
            elapsedTime: 0,
            views: getViewsNumber(r),
            viewsString: getViewsString(r),
            songDuration: getSongDurationSeconds(r),
        };

        if (!byId.has(videoId)) byId.set(videoId, song);
    }

    const songs = Array.from(byId.values()).sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    const continuation = extractContinuationToken(root) ?? extractContinuationToken(response);

    return { songs, continuation };
}