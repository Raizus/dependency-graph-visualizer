import type { GraphJSON } from "@dep-graph-vis/core";

export async function loadPublicJson(path: string): Promise<GraphJSON> {
    const response = await fetch(path);
    return await response.json();
}
