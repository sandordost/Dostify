"use server";

import { searchRadioStationsByName } from "@/lib/pear/radio-client";
import { RadioStation } from "@/lib/types/radio-station";

export async function searchStationsByName(name: string): Promise<RadioStation[]> {
    return searchRadioStationsByName(name);
}
