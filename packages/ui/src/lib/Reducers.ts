import {
    filterFunctionFactory,
    incoming_node_filter_params,
    node_neighbours_filter_params,
    node_siblings_filter_params,
    outgoing_node_filter_params,
    reachable_filter_params,
    reaching_filter_params,
    tracePath,
    type FilterParamsI,
    type Graph,
} from "@dep-graph-vis/core";

/************************************************************************
 *              SELECTION REDUCERS                                      *
 ************************************************************************/

/**
 * Given a graph, current selection of nodes and a function that returns a
 * graph filter parameters, it returns a new selection of nodes.
 * The selection is additive, the selected nodes will be added to the new
 * filtered nodes.
 * @param graph
 * @param selected
 * @param params_builder_func
 * @returns the new selection
 */
function generic_selection_func(
    graph: Graph | null,
    selected: string[],
    params_builder_func: (node_ids: string[]) => FilterParamsI,
): string[] {
    // selection is additive by default
    if (!graph) return [];
    const filter_params = params_builder_func(selected);
    const filter_func = filterFunctionFactory(filter_params);
    const filtered = filter_func(graph);
    const aux = new Set(filtered).union(new Set(selected));
    return filtered;
}

export function select_sources_of_node(
    graph: Graph | null,
    selected: string[],
): string[] {
    return generic_selection_func(graph, selected, incoming_node_filter_params);
}

export function select_targets_of_node(
    graph: Graph | null,
    selected: string[],
): string[] {
    return generic_selection_func(graph, selected, outgoing_node_filter_params);
}

export function select_siblings_of_node(
    graph: Graph | null,
    selected: string[],
): string[] {
    return generic_selection_func(graph, selected, node_siblings_filter_params);
}

export function select_neighbours_of_node(
    graph: Graph | null,
    selected: string[],
): string[] {
    return generic_selection_func(
        graph,
        selected,
        node_neighbours_filter_params,
    );
}

export function select_reachables(
    graph: Graph | null,
    selected: string[],
): string[] {
    return generic_selection_func(graph, selected, reachable_filter_params);
}

export function select_reaching(
    graph: Graph | null,
    selected: string[],
): string[] {
    return generic_selection_func(graph, selected, reaching_filter_params);
}

export function select_reaching_intersection_reachables(
    graph: Graph | null,
    selected: string[],
): string[] {
    const reaching = new Set(select_reaching(graph, selected));
    const reachables = new Set(select_reachables(graph, selected));
    const result = [
        ...reaching.intersection(reachables).union(new Set(selected)),
    ];
    return result;
}

export function select_trace(
    graph: Graph | null,
    from: string[],
    to: string[],
): string[] {
    if (!graph) return [];
    return [...tracePath(graph, from, to)];
}