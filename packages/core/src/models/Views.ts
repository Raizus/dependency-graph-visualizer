import { ClusterManager } from "./Clusters";
import { FilterI, LayoutI, ViewI, ViewsJSON } from "./schema";

export class View implements ViewI {
    label: string;
    filters: FilterI[];
    clusters: ClusterManager;
    layout: LayoutI;

    constructor(
        label: string,
        filters: FilterI[],
        clusters: ClusterManager,
        layout: LayoutI,
    ) {
        this.label = label;
        this.filters = filters;
        this.clusters = clusters;
        this.layout = layout;
    }

    pushFilter(filter: FilterI) {
        this.filters.push(filter);
    }

    unshiftFilter(filter: FilterI) {
        this.filters.unshift(filter);
    }

    /**
     * Adds a filter to the view
     * @param filter
     * @param at_front If true, inserts at the front of the filter stack,
     *  else inserts at the end
     * @returns
     */
    addFilter(filter: FilterI, at_front: boolean = false) {
        const new_filters = at_front
            ? [filter, ...this.filters]
            : [...this.filters, filter];
        
        this.filters = new_filters;
    }

    setFilters(filters: FilterI[]) {
        this.filters = filters;
    }

    getFilter(idx: number): FilterI | undefined {
        if (idx < 0 || idx >= this.filters.length) {
            return undefined;
        }
        return this.filters[idx];
    }

    setLayout(layout: LayoutI) {
        this.layout = layout;
    }

    copy(): View {
        const view_copy = new View(
            this.label,
            [...this.filters],
            this.clusters.copy(),
            { ...this.layout },
        );
        return view_copy;
    }
}

export class ViewMap {
    private map: Map<string, View> = new Map();
    private order: string[] = [];

    has(key: string): boolean {
        return this.map.has(key);
    }

    get(key: string): View | undefined {
        return this.map.get(key);
    }

    set(key: string, value: View, idx: number | null = null): string {
        // if key already exists no need to add it to the order
        if (this.has(key)) {
            this.map.set(key, value);
            return key;
        }

        this.map.set(key, value);
        // insert at position given by idx if not null, else push into the array
        if (idx !== null && idx >= 0 && idx <= this.order.length) {
            this.order[idx] = key;
        } else {
            this.order.push(key);
        }
        return key;
    }

    /**
     * Adds a new view with a unique key based on the provided label. If a view with the same label already exists, appends a number to the label to make it unique.
     * @param key
     * @param value
     * @returns
     */
    add(key: string, value: View): string {
        key = this.generateUniqueKey(key);
        this.set(key, value);
        return key;
    }

    /**
     * Returns an iterator over the keys in the order they were added.
     * @returns 
     */
    keys(): MapIterator<string> {
        return this.order.values();
    }

    size(): number {
        return this.map.size;
    }

    getIndex(key: string): number {
        return this.order.indexOf(key);
    }

    getFirstKey(): string | null {
        const firstKey = this.order[0];
        return firstKey || null;
    }

    delete(key: string): ViewI | undefined {
        const view = this.map.get(key);
        this.map.delete(key);
        this.order = this.order.filter((k) => k !== key);
        return view;
    }

    rename(old_key: string, new_key: string): boolean {
        if (!this.map.has(old_key) || this.map.has(new_key)) {
            return false; // old key must exist and new key must not exist
        }
        const view = this.map.get(old_key)!;
        // keep the order
        const idx = this.getIndex(old_key);
        this.map.delete(old_key);
        this.set(new_key, view, idx);
        return true;
    }

    duplicate(key: string) {
        const view = this.map.get(key);
        if (!view) return;
        const view_copy: View = view.copy();
        const new_key = this.add(key, view_copy);
        return new_key;
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

    static fromJSON(data: ViewsJSON): ViewMap {
        const view_map = new ViewMap();
        for (const [key, view_json] of Object.entries(data)) {
            const clusters = ClusterManager.fromJSON(view_json.clusters);
            const view: View = new View(
                view_json.label,
                view_json.filters,
                clusters,
                view_json.layout,
            );
            view_map.set(key, view);
        }
        return view_map;
    }

    toJSON(): ViewsJSON {
        const json: ViewsJSON = {};
        for (const [key, view] of this.map.entries()) {
            json[key] = {
                label: view.label,
                filters: view.filters,
                clusters: view.clusters.toJSON(),
                layout: view.layout,
            };
        }
        return json;
    }
}

export function newBlanckView(label: string = "View"): View {
    const view: View = new View(
        label,
        [],
        new ClusterManager(),
        { type: "dot" }
    );
    return view;
}

export function newViewMap(): ViewMap {
    const view_map = new ViewMap();
    const label = "View";
    const new_view = newBlanckView(label);
    view_map.add(label, new_view);
    return view_map;
}
