import {
    create_filter,
    incoming_node_filter_params,
    inverse_node_selection_filter_params,
    node_selection_filter_params,
    node_siblings_filter_params,
    outgoing_node_filter_params,
    reachable_filter_params,
    reaching_filter_params,
} from "@dep-graph-vis/core";
import type { StateStore } from "../StateStore";
import { get } from "svelte/store";

function getSubnodesAndSubclusters(state_store: StateStore, nodes: string[]) {
    const view = get(state_store.current_view);
    let subclusters_and_nodes: Set<string> = new Set(nodes);

    for (const node of nodes) {
        const subclusters = view.clusters.getSubclustersRecursive(node);
        const subnodes = view.clusters.getClusterNodes(node);

        subclusters_and_nodes = subclusters_and_nodes.union(
            new Set(subclusters),
        );
        subclusters_and_nodes = subclusters_and_nodes.union(subnodes);
    }

    return [...subclusters_and_nodes];
}

/************************************************************************
 *                 FILTER ACTIONS                                       *
 ************************************************************************/

export function filter_node_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;

    const all_nodes = getSubnodesAndSubclusters(state_store, [node]);
    const filter_params = node_selection_filter_params(all_nodes);
    const filter = create_filter(`${node}`, show, filter_params);
    state_store.addFilter(filter, show);
}

export function filter_selection_action(
    state_store: StateStore,
    show: boolean,
) {
    const selected = get(state_store.selected_nodes);
    const all_nodes = getSubnodesAndSubclusters(state_store, selected);
    const filter_params = node_selection_filter_params(all_nodes);

    const first_nodes = selected.slice(0, Math.min(3, selected.length));
    const label = `Selection Filter: ${first_nodes.join(", ")}...`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter, show);
}

export function filter_all_but_selected_action(
    state_store: StateStore,
    show: boolean,
) {
    const selected = get(state_store.selected_nodes);
    const all_nodes = getSubnodesAndSubclusters(state_store, selected);
    const filter_params = inverse_node_selection_filter_params(all_nodes);

    const first_nodes = selected.slice(0, Math.min(3, selected.length));
    const label = `All but selection of: ${first_nodes.join(", ")}...`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter, show);
}

export function filter_sources_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;
    const all_nodes = getSubnodesAndSubclusters(state_store, [node]);
    const filter_params = incoming_node_filter_params(all_nodes);

    const label = `Sources of ${node}`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter, show);
}

export function filter_targets_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;
    const all_nodes = getSubnodesAndSubclusters(state_store, [node]);
    const filter_params = outgoing_node_filter_params(all_nodes);

    const label = `Targets of ${node}`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter, show);
}

export function filter_siblings_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;
    const all_nodes = getSubnodesAndSubclusters(state_store, [node]);
    const filter_params = node_siblings_filter_params(all_nodes);

    const label = `Siblings of ${node}`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter, show);
}

export function filter_reachables_of_node_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;
    const all_nodes = getSubnodesAndSubclusters(state_store, [node]);
    const filter_params = reachable_filter_params(all_nodes);

    const label = `Reachables of ${node}`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter, show);
}

export function filter_reachables_of_selection_action(
    state_store: StateStore,
    show: boolean,
) {
    const selected = get(state_store.selected_nodes);
    const all_nodes = getSubnodesAndSubclusters(state_store, selected);
    const filter_params = reachable_filter_params(all_nodes);

    const first_nodes = selected.slice(0, Math.min(3, selected.length));
    const label = `Reachables of selection: ${first_nodes.join(", ")}...`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter, show);
}

export function filter_reaching_of_selection_action(
    state_store: StateStore,
    show: boolean,
) {
    const selected = get(state_store.selected_nodes);
    const all_nodes = getSubnodesAndSubclusters(state_store, selected);
    const filter_params = reaching_filter_params(all_nodes);

    const first_nodes = selected.slice(0, Math.min(3, selected.length));
    const label = `Reaching sources of selection: ${first_nodes.join(", ")}...`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter, show);
}

export function filter_nodes_not_reachable_from_outside_action(
    state_store: StateStore,
    cluster_id: string | null,
    show: boolean,
) {
    if (!cluster_id) return;
    const all_nodes = getSubnodesAndSubclusters(state_store, [cluster_id]);
    const filter_params = reachable_filter_params(all_nodes);

    const label = `Nodes not reachable from outside cluster ${cluster_id}`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter, show);
}
