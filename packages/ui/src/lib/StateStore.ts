import { derived, get, writable } from "svelte/store";
import {
    type ViewI,
    type Graph,
    type FilterI,
    newView,
    createProjectionGraph,
    GraphvizLayoutEngine,
} from "@dep-graph-vis/core";

export class StateStore {
    layoutEngine: GraphvizLayoutEngine;

    private _graph = writable<Graph | null>(null);
    private _views = writable<ViewI[]>([]);

    private _selected_nodes = writable<string[]>([]);
    private _clicked_node = writable<string | null>(null);

    private _current_view_idx = writable<number>(0);
    private _projected_graph = writable<Graph | null>(null);
    private _current_view = derived(
        [this._current_view_idx, this._views],
        ([idx, views]) => {
            return views[idx];
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

    setCurrentViewIdx(idx: number) {
        this._current_view_idx.set(0);
    }

    setViews(views: ViewI[]) {
        this._views.set(views);
    }

    setProjectionGraph(graph: Graph) {
        this._projected_graph.set(graph);
    }

    setState(graph: Graph, views: ViewI[]) {
        this.setGraph(graph);
        this.setSelectedNodes([]);
        this.setClickedNode(null);

        // set view and current view
        let new_view = newView();
        if (views.length > 0) {
            new_view = views[0];
            this.setViews(views);
            this.setCurrentViewIdx(0);
        } else {
            this.setViews([new_view]);
            this.setCurrentViewIdx(0);
        }

        const projected_graph = createProjectionGraph(graph, new_view.clusters);
        this.setProjectionGraph(projected_graph);
    }

    addFilter(filter: FilterI, at_front: boolean = false) {
        const view = get(this._current_view);
        const view_idx = get(this._current_view_idx);
        if (!view) return;

        const new_filters = at_front
            ? [filter, ...view.filters]
            : [...view.filters, filter];

        const new_view = {
            ...view,
            filters: new_filters,
        };

        this._views.update((views) => {
            views[view_idx] = new_view;
            return views;
        });

        // TODO: update projection (or some posterior structure)
    }

    updateFilters(filters: FilterI[]) {
        const view = get(this._current_view);
        const view_idx = get(this._current_view_idx);
        if (!view) return;

        const curr_view = get(this._current_view);
        curr_view.filters = filters;

        // TODO: update projection (or some posterior structure)
    }

    addView(view: ViewI) {
        this._views.update((views) => [...views, view]);
        const l = get(this._views).length - 1;
        this.setCurrentViewIdx(l);
    }

    updateProjection() {
        const graph = get(this._graph);
        if (!graph) return;

        const curr_view = get(this._current_view);
        const proj_graph = createProjectionGraph(graph, curr_view.clusters);
        this.setProjectionGraph(proj_graph);
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
}
