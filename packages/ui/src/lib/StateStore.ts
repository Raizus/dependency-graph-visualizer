import { derived, get, writable, type Writable } from "svelte/store";
import {
    type ViewI,
    type Graph,
    type FilterI,
    newView,
    createProjectionGraph,
    GraphvizLayoutEngine,
    ViewMap,
    newViewMap,
    type LayoutI,
    searchGraphForNodes,
} from "@dep-graph-vis/core";

export class StateStore {
    layoutEngine: GraphvizLayoutEngine;

    private _graph = writable<Graph | null>(null);
    private _views = writable<ViewMap>(newViewMap());

    private _selected_nodes = writable<string[]>([]);
    private _clicked_node = writable<string | null>(null);

    private _current_view_label = writable<string | null>(null);
    private _projected_graph = writable<Graph | null>(null);
    private _current_view = derived(
        [this._current_view_label, this._views],
        ([label, views]) => {
            if (!label) return newView("View");
            const view = views.get(label);
            return view || newView();
        },
    );

    constructor() {
        // ... existing initialization
        this.layoutEngine = new GraphvizLayoutEngine();
    }

    async initialize() {
        await this.layoutEngine.initialize();
    }

    // Public readable stores
    public graph = { subscribe: this._graph.subscribe };
    public views = { subscribe: this._views.subscribe };

    public current_view_label = {
        subscribe: this._current_view_label.subscribe,
    };
    public current_view = { subscribe: this._current_view.subscribe };
    public selected_nodes = { subscribe: this._selected_nodes.subscribe };
    public clicked_node = { subscribe: this._clicked_node.subscribe };

    public projected_graph = { subscribe: this._projected_graph.subscribe };

    // Actions
    setGraph(graph: Graph) {
        this._graph.set(graph);
    }

    setClickedNode(node: string | null) {
        this._clicked_node.set(node);
    }

    setSelectedNodes(nodes: string[]) {
        this._selected_nodes.set(nodes);
    }

    setCurrentViewLabel(label: string) {
        this._current_view_label.set(label);
        this.updateProjection();
    }

    private setViews(views: ViewMap) {
        this._views.set(views);
    }

    private setProjectionGraph(graph: Graph) {
        this._projected_graph.set(graph);
    }

    updateProjection() {
        const graph = get(this._graph);
        if (!graph) return;

        const curr_view = get(this._current_view);
        const proj_graph = createProjectionGraph(graph, curr_view.clusters);
        this.setProjectionGraph(proj_graph);
    }

    setState(graph: Graph, views: ViewMap) {
        this.setGraph(graph);
        this.setSelectedNodes([]);
        this.setClickedNode(null);

        // If view map is empty add a new view
        let label = views.getFirstKey() || "View";
        const view = views.get(label) || newView(label);
        if (views.size() === 0) {
            views.set(label, view);
        }

        this.setCurrentViewLabel(label);
        this.setViews(views);

        this.updateProjection();
    }

    addFilter(filter: FilterI, at_front: boolean = false) {
        const view = get(this._current_view);
        const view_label = get(this._current_view_label);
        if (!view) return;

        const new_filters = at_front
            ? [filter, ...view.filters]
            : [...view.filters, filter];

        const new_view = {
            ...view,
            filters: new_filters,
        };

        this._views.update((views) => {
            views.set(view_label!, new_view);
            return views;
        });

        // TODO: update projection (or some posterior structure)
    }

    updateFilters(filters: FilterI[]) {
        const view = get(this._current_view);
        const view_idx = get(this._current_view_label);
        if (!view) return;

        const curr_view = get(this._current_view);
        curr_view.filters = filters;

        // TODO: update projection (or some posterior structure)
    }

    addView(view: ViewI) {
        let label = "View";
        this._views.update((views) => {
            label = views.set(label, view);
            return views;
        });
        this.setCurrentViewLabel(label);
    }

    // addCluster(cluster: ClusterI) {
    //     const view = get(this._currentView);
    //     if (!view) return;

    //     this._currentView.update((v) => ({
    //         ...v,
    //         clusters: [...v.clusters, cluster],
    //     }));
    // }

    // Clustering
    unfoldAllClusters() {
        const curr_view = get(this._current_view);
        const expanded = curr_view.clusters.expandAllClusters();
        if (expanded.size === 0) return;

        this.updateProjection();
    }

    foldAllClusters() {
        const curr_view = get(this._current_view);
        const collapsed = curr_view.clusters.collapseAllClusters();
        if (collapsed.size === 0) return;

        this.updateProjection();
    }

    foldOrUnfoldCluster(cluster_id: string) {
        const curr_view = get(this._current_view);

        const cluster = curr_view.clusters.getCluster(cluster_id);
        if (!cluster) return;

        if (cluster?.expanded) {
            this.foldCluster(cluster_id);
        } else {
            this.unfoldCluster(cluster_id);
        }

        this.updateProjection();
    }

    foldCluster(cluster_id: string) {
        const curr_view = get(this._current_view);
        const success = curr_view.clusters.collapseCluster(cluster_id);
        if (!success) return;

        this.updateProjection();
    }

    unfoldCluster(cluster_id: string) {
        const curr_view = get(this._current_view);
        const success = curr_view.clusters.expandCluster(cluster_id);
        if (!success) return;

        this.updateProjection();
    }

    setViewLayout(view_id: string, layout: LayoutI) {
        this._views.update((views) => {
            const view = views.get(view_id);
            if (!view) return views;

            view.layout = layout;
            return views;
        });

        // if it is the current view that was updated we need to update the rendered graph
        const curr_view_label = get(this._current_view_label);
        if (curr_view_label !== view_id) return;

        // updating projected graph will trigger the re-render
        this._projected_graph.update((graph) => graph);
    }

    searchProjectionGraphNodes(query: string): string[] {
        if (query.trim() === "") return [];

        const graph = get(this._projected_graph);
        if (!graph) return [];

        const filtered_results = searchGraphForNodes(graph, query.trim());
        return filtered_results;
    }

    // async relayout(): Promise<string> {
    //     this.updateProjection();
    //     const graph = get(this.projected_graph);
    //     const view = get(this._current_view);
    //     const dot = this.layoutEngine.buildDot(graph, view.clusters);
    //     const svg_str = await this.layoutEngine.computeSvg(dot);
    //     return svg_str;
    // }
}
