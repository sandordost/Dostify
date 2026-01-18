"use client";

const KEY = "dostify:config";

type Config = {
    pearApiUrl?: string;
    // spotifyApiUrl?: string; // later
};

const DEFAULTS: Required<Pick<Config, "pearApiUrl">> = {
    pearApiUrl: "http://localhost:6767/api/v1",
};

function readConfig(): Config {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return {};
        return JSON.parse(raw) as Config;
    } catch {
        return {};
    }
}

function writeConfig(next: Config) {
    localStorage.setItem(KEY, JSON.stringify(next));
}

export function getPearApiUrl(): string {
    const cfg = readConfig();
    return (cfg.pearApiUrl ?? DEFAULTS.pearApiUrl).trim();
}

export function setPearApiUrl(url: string) {
    const cfg = readConfig();
    writeConfig({ ...cfg, pearApiUrl: url.trim() });
}