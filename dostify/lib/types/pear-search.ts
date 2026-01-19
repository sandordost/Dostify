export type PearSearchBody = {
    query: string;
    params?: string;
    continuation?: string;
};

export type PearSearchResponse = Record<string, unknown>;
