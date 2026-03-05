import {
    create_filter,
    incoming_node_filter_params,
    inverse_node_selection_filter_params,
    node_selection_filter_params,
    node_siblings_filter_params,
    outgoing_node_filter_params,
    reachable_filter_params,
    type Graph,
} from "@dep-graph-vis/core";
import {
    select_neighbours_of_node,
    select_reachables,
    select_reaching,
    select_reaching_intersection_reachables,
    select_siblings_of_node,
    select_sources_of_node,
    select_targets_of_node,
} from "./Reducers";
import type { StateStore } from "./StateStore";
import { get } from "svelte/store";

/************************************************************************
 *              SELECTION ACTIONS                                       *
 ************************************************************************/

function generic_update_selection_for_node_action(
    node: string | null,
    state_store: StateStore,
    select_func: (graph: Graph | null, selected: string[]) => string[],
) {
    if (node === null) return;
    const graph = get(state_store.projected_graph);
    const new_selected = new Set(select_func(graph, [node]));
    const old_selected = new Set(get(state_store.selected_nodes));
    state_store.setSelectedNodes([...new_selected.union(old_selected)]);
}

function generic_update_selection_for_selection_action(
    state_store: StateStore,
    select_func: (graph: Graph | null, selected: string[]) => string[],
) {
    const graph = get(state_store.projected_graph);
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

/************************************************************************
 *                 FILTER ACTIONS                                       *
 ************************************************************************/

export function filter_node_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;
    const filter_params = node_selection_filter_params([node]);
    const filter = create_filter(`${node}`, show, filter_params);
    state_store.addFilter(filter);
}

export function filter_selection_action(
    state_store: StateStore,
    show: boolean,
) {
    const selected = get(state_store.selected_nodes);
    const filter_params = node_selection_filter_params(selected);

    const first_nodes = selected.slice(0, Math.min(3, selected.length));
    const label = `Selection Filter: ${first_nodes.join(", ")}...`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter);
}

export function filter_all_but_selected_action(
    state_store: StateStore,
    show: boolean,
) {
    const selected = get(state_store.selected_nodes);
    const filter_params = inverse_node_selection_filter_params(selected);

    const first_nodes = selected.slice(0, Math.min(3, selected.length));
    const label = `All but selection of: ${first_nodes.join(", ")}...`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter);
}

export function filter_sources_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;
    const filter_params = incoming_node_filter_params([node]);

    const label = `Sources of ${node}`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter);
}

export function filter_targets_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;
    const filter_params = outgoing_node_filter_params([node]);

    const label = `Targets of ${node}`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter);
}

export function filter_siblings_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;
    const filter_params = node_siblings_filter_params([node]);

    const label = `Siblings of ${node}`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter);
}

export function filter_reachables_of_node_action(
    state_store: StateStore,
    node: string | null,
    show: boolean,
) {
    if (node === null) return;
    const filter_params = reachable_filter_params([node]);

    const label = `Reachables of ${node}`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter);
}

export function filter_reachables_of_selection_action(
    state_store: StateStore,
    show: boolean,
) {
    const selected = get(state_store.selected_nodes);
    const filter_params = reachable_filter_params(selected);

    const first_nodes = selected.slice(0, Math.min(3, selected.length));
    const label = `Reachables of selection: ${first_nodes.join(", ")}...`;
    const filter = create_filter(label, show, filter_params);
    state_store.addFilter(filter);
}
