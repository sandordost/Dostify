import { mpv } from "@/lib/server/mpv";
import type { RadioStation } from "@/lib/types/radio-station";
import { BasePlayer } from "./base-player";

export class RadioPlayer extends BasePlayer {
    private currentStation: RadioStation | null = null;

    async SetRadioStation(station: RadioStation): Promise<void> {
        this.currentStation = station;

        const s: any = station;
        const url = s.url_resolved ?? s.url;
        if (!url) throw new Error("Station has no stream url");

        await mpv({ command: ["loadfile", url, "replace"] });
        await mpv({ command: ["set_property", "pause", false] });
    }

    async Play(): Promise<void> {
        await mpv({ command: ["set_property", "pause", false] });
    }

    async Pause(): Promise<void> {
        await mpv({ command: ["set_property", "pause", true] });
    }

    async IsPlaying(): Promise<boolean> {
        const r = await mpv({ command: ["get_property", "pause"] });
        console.log(r);
        return !(r?.data === true);
    }

    async GetVolumePercent(): Promise<number> {
        const r = await mpv({ command: ["get_property", "volume"] });
        const v = typeof r?.data === "number" ? r.data : 0;
        return Math.round(v);
    }

    async SetVolumePercent(percent: number): Promise<void> {
        const v = Math.max(0, Math.min(100, Math.round(percent)));
        await mpv({ command: ["set_property", "volume", v] });
    }

    getCurrentStation() {
        return this.currentStation;
    }
}
