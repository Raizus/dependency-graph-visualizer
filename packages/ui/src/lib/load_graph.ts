import type { StateJSON } from "@dep-graph-vis/core";

export async function loadPublicJson(path: string): Promise<StateJSON> {
    const response = await fetch(path);
    return await response.json();
}
