import { derived, get, writable, type Writable } from "svelte/store";
import {
    type Graph,
    type FilterI,
    newBlanckView,
    createClusteredGraph,
    GraphvizLayoutEngine,
    ViewMap,
    newViewMap,
    type LayoutI,
    searchGraphForNodes,
    layoutToDotOptions,
    type StateJSON,
    apply_filters,
    filtered_subgraph,
    View,
    loadDirectedGraphFromJSON,
    ClusterManager,
    buildHierarquicalClusters,
    assignNodeRanks,
    graphToJSON,
} from "@dep-graph-vis/core";
import type { GraphRenderer } from "./visualizer/GraphRenderer";

export function loadStateJson(data: StateJSON): {
    graph: Graph;
    views: ViewMap;
} {
    const graph = loadDirectedGraphFromJSON(data.graph);
    assignNodeRanks(graph);

    const create_hierarchical_view = !data.views; // if views are not provided we create a default hierarchical view

    if (!create_hierarchical_view) {
        const views = data.views ? ViewMap.fromJSON(data.views) : newViewMap();
        return { graph, views };
    }

    const label = "Hierarchical View";
    const view = newBlanckView(label);
    const cluster_map = buildHierarquicalClusters(graph);
    view.clusters = new ClusterManager([...cluster_map.values()]);
    const view_map = new ViewMap();
    view_map.set(label, view);

    return {
        graph,
        views: view_map,
    };
}

export class StateStore {
    layoutEngine: GraphvizLayoutEngine;

    private _graph = writable<Graph | null>(null);
    private _views = writable<ViewMap>(newViewMap());

    private _selected_nodes = writable<string[]>([]);

    private _current_view_label = writable<string | null>(null);
    private _current_view = writable<View>(
        (() => {
            const views = get(this._views);
            const label = get(this._current_view_label);
            if (!label) return newBlanckView("View");
            const view = views.get(label);
            return view || newBlanckView("View");
        })(),
    );

    private _clustered_graph = writable<Graph | null>(null);
    private _filtered_clustered_graph = writable<Graph | null>(null);
    private _hidden_nodes = writable<Set<string>>(new Set());
    private _shown_nodes = writable<Set<string>>(new Set());
    private _renderer = writable<GraphRenderer | null>(null);

    // Public readable stores
    public graph = { subscribe: this._graph.subscribe };
    public views = { subscribe: this._views.subscribe };

    public current_view_label = {
        subscribe: this._current_view_label.subscribe,
    };
    public current_view = { subscribe: this._current_view.subscribe };
    public selected_nodes = { subscribe: this._selected_nodes.subscribe };
    public hidden_nodes = { subscribe: this._hidden_nodes.subscribe };
    public shown_nodes = { subscribe: this._shown_nodes.subscribe };

    public clustered_graph = { subscribe: this._clustered_graph.subscribe };
    public filtered_clustered_graph = {
        subscribe: this._filtered_clustered_graph.subscribe,
    };
    public renderer = { subscribe: this._renderer.subscribe };

    constructor() {
        // ... existing initialization
        this.layoutEngine = new GraphvizLayoutEngine();
    }

    async initialize() {
        await this.layoutEngine.initialize();
    }

    setRenderer(renderer: GraphRenderer | null) {
        this._renderer.set(renderer);
    }

    getRenderer(): GraphRenderer | null {
        return get(this._renderer);
    }

    // Actions
    setGraph(graph: Graph) {
        this._graph.set(graph);
    }

    setSelectedNodes(nodes: string[]) {
        this._selected_nodes.set(nodes);
    }

    setCurrentViewLabel(label: string | null) {
        if (!label) {
            const view = newBlanckView("View");
            this._current_view.set(view);
            return;
        }

        const views = get(this._views);
        const view = views.get(label);
        if (!view) {
            const view = newBlanckView("View");
            this._current_view.set(view);
            return;
        }

        this._current_view_label.set(label);
        this._current_view.set(view);
        this.updateClusteredGraph();
    }

    private setViews(views: ViewMap) {
        this._views.set(views);
    }

    private setProjectionGraph(graph: Graph) {
        this._clustered_graph.set(graph);
    }

    updateFilteredClusteredGraph() {
        const clustered_graph = get(this._clustered_graph);
        if (!clustered_graph) return;

        const curr_view = get(this._current_view);
        const [shown_nodes, hidden_nodes] = apply_filters(
            clustered_graph,
            curr_view.filters,
        );
        // TODO: filter by considering the clusters
        const filtered_graph = filtered_subgraph(clustered_graph, shown_nodes);
        this._filtered_clustered_graph.set(filtered_graph);
    }

    updateClusteredGraph() {
        const graph = get(this._graph);
        if (!graph) return;

        const curr_view = get(this._current_view);
        const proj_graph = createClusteredGraph(graph, curr_view.clusters);
        this.setProjectionGraph(proj_graph);
        this.updateFilteredClusteredGraph();
    }

    setState(graph: Graph, views: ViewMap) {
        this.setGraph(graph);
        this.setSelectedNodes([]);

        // If view map is empty add a new view
        let label = views.getFirstKey() || "View";
        const view = views.get(label) || newBlanckView(label);
        if (views.size() === 0) {
            views.set(label, view);
        }

        this.setViews(views);
        this.setCurrentViewLabel(label);

        this.updateClusteredGraph();
    }

    /* ------------------------------------------------------------------------------------------- */
    /* ----- Filter related methods -------------------------------------------------------------- */

    /**
     * Adds a filter to the current view
     * @param filter
     * @param at_front If true, inserts at the front of the filter stack,
     *  else inserts at the end
     * @returns
     */
    addFilter(filter: FilterI, at_front: boolean = false) {
        const view = get(this._current_view);
        const view_label = get(this._current_view_label);
        if (!view || !view_label) return;

        view.addFilter(filter, at_front);

        this._views.update((views) => {
            views.set(view_label, view);
            return views;
        });

        // TODO: update projection (or some posterior structure)
        this.updateFilteredClusteredGraph();
    }

    updateFilters(filters: FilterI[]) {
        const view = get(this._current_view);
        const view_idx = get(this._current_view_label);
        if (!view) return;

        const curr_view = get(this._current_view);
        curr_view.filters = filters;

        // TODO: update projection (or some posterior structure)
    }

    filterSetApplied(filter_idx: number, value: boolean) {
        const view = get(this._current_view);
        if (!view) return;

        const filter = view.getFilter(filter_idx);
        if (!filter) return;
        filter.applied = value;

        this.updateFilteredClusteredGraph();
    }

    filterSetShow(filter_idx: number, value: boolean) {
        const view = get(this._current_view);
        if (!view) return;

        const filter = view.getFilter(filter_idx);
        if (!filter) return;
        filter.show = value;

        this.updateFilteredClusteredGraph();
    }

    filterMoveUp(filter_idx: number) {
        const view = get(this._current_view);
        if (!view) return;

        const filters = view.filters;
        if (filter_idx <= 0 || filter_idx >= filters.length) {
            return;
        }
        [filters[filter_idx - 1], filters[filter_idx]] = [
            filters[filter_idx],
            filters[filter_idx - 1],
        ];
        view.filters = filters;

        this.updateCurrentView(view);
        this.updateFilteredClusteredGraph();
    }

    filterMoveDown(filter_idx: number) {
        const view = get(this._current_view);
        if (!view) return;

        const filters = view.filters;
        if (filter_idx < 0 || filter_idx >= filters.length) {
            return;
        }
        [filters[filter_idx + 1], filters[filter_idx]] = [
            filters[filter_idx],
            filters[filter_idx + 1],
        ];
        view.filters = filters;

        this.updateCurrentView(view);
        this.updateFilteredClusteredGraph();
    }

    deleteFilter(filter_idx: number) {
        const view = get(this._current_view);
        if (!view) return;

        console.log("deleting filter");
        const filters = view.filters;
        filters.splice(filter_idx, 1);

        this.updateCurrentView(view);
        this.updateFilteredClusteredGraph();
    }

    /* ------------------------------------------------------------------------------------------- */
    /* ----- Cluster related methods ------------------------------------------------------------- */

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

        this.updateClusteredGraph();
    }

    foldAllClusters() {
        const curr_view = get(this._current_view);
        const collapsed = curr_view.clusters.collapseAllClusters();
        if (collapsed.size === 0) return;

        this.updateClusteredGraph();
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

        this.updateClusteredGraph();
    }

    foldCluster(cluster_id: string) {
        const curr_view = get(this._current_view);
        const success = curr_view.clusters.collapseCluster(cluster_id);
        if (!success) return;

        this.updateClusteredGraph();
    }

    unfoldCluster(cluster_id: string) {
        const curr_view = get(this._current_view);
        const success = curr_view.clusters.expandCluster(cluster_id);
        if (!success) return;

        this.updateClusteredGraph();
    }

    foldDirectChildClusters(cluster_id: string) {
        const curr_view = get(this._current_view);
        const child_clusters =
            curr_view.clusters.getDirectSubclusters(cluster_id);
        curr_view.clusters.collapseClusters(child_clusters);

        this.updateClusteredGraph();
    }

    unfoldDirectChildClusters(cluster_id: string) {
        const curr_view = get(this._current_view);
        const child_clusters =
            curr_view.clusters.getDirectSubclusters(cluster_id);
        curr_view.clusters.expandClusters(child_clusters);

        this.updateClusteredGraph();
    }

    /* ------------------------------------------------------------------------------------------- */
    /* ----- View related methods ---------------------------------------------------------------- */

    updateCurrentView(view: View) {
        const current_view_label = get(this._current_view_label);
        if (!current_view_label) return;

        this._views.update((views) => {
            views.set(current_view_label, view);
            return views;
        });

        this._current_view.update(() => view);
    }

    addView(view: View) {
        let label = "View";
        this._views.update((views) => {
            label = views.set(label, view);
            return views;
        });
        this.setCurrentViewLabel(label);
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
        this._clustered_graph.update((graph) => graph);
    }

    deleteView(view_id: string) {
        const views = get(this._views);
        const current_view_label = get(this._current_view_label);

        const deleted = views.delete(view_id);
        if (!deleted) return;

        // update views
        this.setViews(views);

        if (view_id != current_view_label) return;

        // set new view
        const new_current_label = views.getFirstKey();
        this.setCurrentViewLabel(new_current_label);
    }

    duplicateView(view_id: string) {
        const views = get(this._views);

        const new_view_id = views.duplicate(view_id);
        if (!new_view_id) return; // duplication failed

        // update views
        this.setViews(views);
        this.setCurrentViewLabel(new_view_id);
    }

    renameView(old_name: string, new_name: string): boolean {
        if (new_name === old_name) return false;
        const views = get(this._views);

        const success = views.rename(old_name, new_name);
        if (!success) return false;
        this.setViews(views);
        const current_view_label = get(this._current_view_label);
        if (old_name !== current_view_label) return true;
        this.setCurrentViewLabel(new_name);

        return true;
    }

    reorderViews(new_order: string[]) {
        const views = get(this._views);
        views.setOrder(new_order);
        this.setViews(views);
    }

    /* ------------------------------------------------------------------------------------------- */
    /* ----- Other methods ----------------------------------------------------------------------- */

    searchFilteredGraphNodes(query: string): string[] {
        if (query.trim() === "") return [];

        const graph = get(this._filtered_clustered_graph);
        if (!graph) return [];

        const filtered_results = searchGraphForNodes(graph, query.trim());
        return filtered_results;
    }

    getDotForCurrentView(): string | null {
        const graph = get(this._filtered_clustered_graph);
        if (!graph) return null;

        const view = get(this._current_view);
        const dot_options = layoutToDotOptions(view.layout);
        const dot = this.layoutEngine.buildDot(
            graph,
            view.clusters,
            dot_options,
        );
        return dot;
    }

    toJSON(): StateJSON {
        const graph = get(this._graph);
        const views = get(this._views);

        if (!graph) {
            throw new Error("Graph is not set");
        }

        return {
            graph: graphToJSON(graph),
            views: views.toJSON(),
        };
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
