import { ClusterManager } from "./Clusters";
import { ViewI } from "./schema";

export class ViewMap {
    private map: Map<string, ViewI> = new Map();

    has(key: string): boolean {
        return this.map.has(key);
    }

    get(key: string): ViewI | undefined {
        return this.map.get(key);
    }

    set(key: string, value: ViewI): string {
        key = this.generateUniqueKey(key);
        this.map.set(key, value);
        return key;
    }

    keys(): MapIterator<string> {
        return this.map.keys();
    }

    size(): number {
        return this.map.size;
    }

    getFirstKey(): string | null {
        const firstKey = this.map.keys().next().value;
        return firstKey || null;
    }

    private generateUniqueKey(label: string): string {
        let key = label;
        let counter = 2;
        while (this.map.has(key)) {
            key = `${label} (${counter})`;
            counter++;
        }
        return key;
    }
}

export function newViewMap(): ViewMap {
    const view_map = new ViewMap();
    const new_view = newView("View");
    view_map.set("View", new_view);
    return view_map
}

export function newView(label: string = "View"): ViewI {
    const view: ViewI = {
        label,
        filters: [],
        clusters: new ClusterManager(),
        layout: { type: "dot" },
    };
    return view;
}
