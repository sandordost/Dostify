import net from "node:net";

const SOCKET = process.env.MPV_SOCKET ?? "/tmp/pear-mpv.sock";

export function mpv(command: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const client = net.createConnection(SOCKET);

        let out = "";
        client.on("connect", () => {
            client.write(JSON.stringify(command) + "\n");
            client.end();
        });

        client.on("data", (d) => (out += d.toString("utf8")));
        client.on("error", reject);
        client.on("close", () => {
            const line = out.trim().split("\n").pop() ?? "";
            if (!line) return resolve({});
            try {
                resolve(JSON.parse(line));
            } catch {
                resolve({});
            }
        });
    });
}

export async function mpvGet(property: string) {
    const r = await mpv({ command: ["get_property", property] });
    return r?.data;
}

export async function mpvGetMany(properties: string[]) {
    const entries = await Promise.all(
        properties.map(async (p) => [p, await mpvGet(p)] as const)
    );
    return Object.fromEntries(entries) as Record<string, any>;
}