export function getPearApiUrlServer() {
    const url = process.env.PEAR_API_URL ?? "http://127.0.0.1:6767/api/v1";
    return url.trim();
}
