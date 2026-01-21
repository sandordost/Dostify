import { RadioStation } from "../types/radio-station";

const baseUrl = "https://de1.api.radio-browser.info/json/stations/"
const limit = 50;

export async function radioStationRequest<T = unknown>(
    path: string,
    options: { method?: "GET" | "POST" | "DELETE" | "PATCH"; body?: any } = {}
): Promise<T> {
    const method = options.method ?? "GET";

    const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" || method === "PATCH" ? JSON.stringify(options.body ?? {}) : undefined,
    });

    const contentType = res.headers.get("content-type") ?? "";
    const raw = await res.text();

    const data = contentType.includes("application/json") && raw
        ? (JSON.parse(raw) as T)
        : (undefined as unknown as T);

    if (!res.ok) {
        throw new Error(`Pear ${method} ${path} failed (${res.status}). Body: ${raw.slice(0, 300)}`);
    }

    return (data ?? (raw as unknown as T));
}

export async function searchRadioStationsByName(name: string) {
    const path = `search?name=${name}&order=clickcount&reverse=true&limit=${limit}`
    return radioStationRequest<RadioStation[]>(path);
} 