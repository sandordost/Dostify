export type RadioStation = {
    stationuuid: string;
    name: string;
    url: string;
    url_resolved: string;
    favicon: string;
    tags: string;
    country: string;
    countrycode: string;
    votes: number;
    lastchangetime: Date;
    codec: string;
    clickcount: number;
    has_extended_info: boolean;
}