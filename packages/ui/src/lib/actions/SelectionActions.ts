import {
    filterFunctionFactory,
    inverse_node_selection_filter_params,
    type Graph,
} from "@dep-graph-vis/core";
import { get } from "svelte/store";
import {
    select_sources_of_node,
    select_targets_of_node,
    select_siblings_of_node,
    select_neighbours_of_node,
    select_reachables,
    select_reaching,
    select_reaching_intersection_reachables,
    select_trace,
} from "../Reducers";
import type { StateStore } from "../StateStore";

/************************************************************************
 *              SELECTION ACTIONS                                       *
 ************************************************************************/
function generic_update_selection_for_node_action(
    node: string | null,
    state_store: StateStore,
    select_func: (graph: Graph | null, selected: string[]) => string[],
) {
    if (node === null) return;
    const graph = get(state_store.clustered_graph);
    const new_selected = new Set(select_func(graph, [node]));
    const old_selected = new Set(get(state_store.selected_nodes));
    state_store.setSelectedNodes([...new_selected.union(old_selected)]);
}
function generic_update_selection_for_selection_action(
    state_store: StateStore,
    select_func: (graph: Graph | null, selected: string[]) => string[],
) {
    const graph = get(state_store.clustered_graph);
    const selection = get(state_store.selected_nodes);
    const new_selected = new Set(select_func(graph, selection));
    const old_selected = new Set(selection);
    state_store.setSelectedNodes([...new_selected.union(old_selected)]);
}

export function set_selection_to_this_node(
    node: string | null,
    state_store: StateStore,
) {
    if (node === null) return;
    state_store.setSelectedNodes([node]);
}

export function set_selection_to_sources_of_node(
    node: string | null,
    state_store: StateStore,
) {
    generic_update_selection_for_node_action(
        node,
        state_store,
        select_sources_of_node,
    );
}

export function set_selection_to_targets_of_node(
    node: string | null,
    state_store: StateStore,
) {
    generic_update_selection_for_node_action(
        node,
        state_store,
        select_targets_of_node,
    );
}

export function set_selection_to_siblings_of_node(
    node: string | null,
    state_store: StateStore,
) {
    generic_update_selection_for_node_action(
        node,
        state_store,
        select_siblings_of_node,
    );
}

export function set_selection_to_neighbours_of_node(
    node: string | null,
    state_store: StateStore,
) {
    generic_update_selection_for_node_action(
        node,
        state_store,
        select_neighbours_of_node,
    );
}

export function set_selection_to_reachables_of_node(
    node: string | null,
    state_store: StateStore,
) {
    generic_update_selection_for_node_action(
        node,
        state_store,
        select_reachables,
    );
}

export function set_selection_to_reachables_of_selection(
    state_store: StateStore,
) {
    generic_update_selection_for_selection_action(
        state_store,
        select_reachables,
    );
}

export function set_selection_to_reaching_of_node(
    node: string | null,
    state_store: StateStore,
) {
    generic_update_selection_for_node_action(
        node,
        state_store,
        select_reaching,
    );
}

export function set_selection_to_reaching_of_selection(
    state_store: StateStore,
) {
    generic_update_selection_for_selection_action(state_store, select_reaching);
}

export function set_selection_to_intersection_of_reaching_reachables(
    node: string | null,
    state_store: StateStore,
) {
    generic_update_selection_for_node_action(
        node,
        state_store,
        select_reaching_intersection_reachables,
    );
}

export function set_selection_to_nodes_of_cluster_action(
    state_store: StateStore,
    cluster_id: string | null,
) {
    if (!cluster_id) return;
    const view = get(state_store.current_view);
    const nodes = view.clusters.getClusterNodes(cluster_id);
    const sub_clusters = view.clusters.getSubclustersRecursive(cluster_id);
    state_store.setSelectedNodes([...nodes, ...sub_clusters]);
}

export function invert_selection_action(state_store: StateStore) {
    const selection = get(state_store.selected_nodes);
    const graph = get(state_store.clustered_graph);
    if (!graph) return;

    const filter_params = inverse_node_selection_filter_params(selection);
    const filter_func = filterFunctionFactory(filter_params);
    const inverse = filter_func(graph);
    state_store.setSelectedNodes(inverse);
}

/**
 * Sets the selection to the trace from the given node to the current selection
 * If there are multiple paths from the node to the selection, all nodes in all paths will be selected
 * @param state_store 
 * @param node_id 
 * @returns 
 */
export function set_selection_to_trace_from_node_action(
    state_store: StateStore,
    node_id: string | null,
) {
    if (node_id === null) return;
    const graph = get(state_store.clustered_graph);
    const selection = get(state_store.selected_nodes);
    const trace = select_trace(graph, [node_id], selection);
    state_store.setSelectedNodes([...trace]);
}

/**
 * Sets the selection to the trace from the current selection to the given node
 * If there are multiple paths from the selection to the node, all nodes in all paths will be selected
 * @param state_store 
 * @param node_id 
 * @returns 
 */
export function set_selection_to_trace_to_node_action(
    state_store: StateStore,
    node_id: string | null,
) {
    if (node_id === null) return;
    const graph = get(state_store.clustered_graph);
    const selection = get(state_store.selected_nodes);
    const trace = select_trace(graph, selection, [node_id]);
    state_store.setSelectedNodes([...trace]);
}