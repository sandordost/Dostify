export function getPearApiUrlServer() {
    const url = process.env.PEAR_API_URL ?? "http://localhost:6767/api/v1";
    return url.trim();
}
