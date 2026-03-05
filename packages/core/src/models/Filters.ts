import { subgraph } from "graphology-operators";
import {
    FilterParamsI,
    FilterI,
    Graph,
    IncomingNodeFilterParamsI,
    InverseNodeSelectionFilterParamsI,
    NodeSelectionFilterParamsI,
    NodeTypeFilterParamsI,
    OutgoingNodeFilterParamsI,
    RegexFilterParamsI,
    NodeSiblingsFilterParamsI,
    ReachableFilterParamsI,
    ReachingFilterParamsI,
    NodeNeighboursFilterParamsI,
    NoOutgoingFilterParamsI,
} from "./schema";
import { findReachableNodes, findReachingNodes } from "./Algorithms";
import { uniqueId } from "../utils";

type FilterFunc = (graph: Graph) => string[];

function get_regex_filter_func(data: RegexFilterParamsI): FilterFunc {
    const func: FilterFunc = (graph) => {
        const regex = new RegExp(data.pattern, data.flags);
        const filtered = graph.filterNodes((node, attr) => {
            return (
                regex.test(graph.getNodeAttribute(node, "label")) ||
                regex.test(graph.getNodeAttribute(node, "full_path"))
            );
        });
        return filtered;
    };

    return func;
}

function get_node_type_filter(data: NodeTypeFilterParamsI): FilterFunc {
    const func: FilterFunc = (graph) => {
        const filtered = graph.filterNodes((node, attr) => {
            return attr.type === data.node_type;
        });
        return filtered;
    };

    return func;
}

function get_outgoing_node_filter_func(
    data: OutgoingNodeFilterParamsI,
): FilterFunc {
    const func: FilterFunc = (graph) => {
        const result = new Set<string>();
        data.node_ids.forEach((nodeId) => {
            graph.forEachOutNeighbor(nodeId, (neighbor) =>
                result.add(neighbor),
            );
        });
        return Array.from(result);
    };

    return func;
}

function get_incoming_node_filter_func(
    data: IncomingNodeFilterParamsI,
): FilterFunc {
    const func: FilterFunc = (graph) => {
        const result = new Set<string>();
        data.node_ids.forEach((nodeId) => {
            graph.forEachInNeighbor(nodeId, (neighbor) => result.add(neighbor));
        });
        return Array.from(result);
    };

    return func;
}

function get_node_neighbours_filter_func(
    data: NodeNeighboursFilterParamsI,
): FilterFunc {
    const func: FilterFunc = (graph) => {
        const result = new Set<string>();
        data.node_ids.forEach((nodeId) => {
            graph.forEachNeighbor(nodeId, (neighbour) => {
                result.add(neighbour);
            });
        });
        return Array.from(result);
    };

    return func;
}

function get_node_siblings_filter_func(
    data: NodeSiblingsFilterParamsI,
): FilterFunc {
    const func: FilterFunc = (graph) => {
        const result = new Set<string>();
        data.node_ids.forEach((nodeId) => {
            graph.forEachInNeighbor(nodeId, (parent) => {
                graph.forEachOutNeighbor(parent, (child) => {
                    if (child !== nodeId) result.add(child);
                });
            });
        });
        return Array.from(result);
    };

    return func;
}

function get_node_selection_filter_func(
    data: NodeSelectionFilterParamsI,
): FilterFunc {
    const func: FilterFunc = (graph) => {
        const result = new Set<string>();
        data.node_ids.forEach((node) => {
            if (graph.hasNode(node)) result.add(node);
        });
        return Array.from(result);
    };

    return func;
}

function get_inverse_selection_node_filter_func(
    data: InverseNodeSelectionFilterParamsI,
): FilterFunc {
    const func: FilterFunc = (graph) => {
        const filtered = graph.filterNodes(
            (node) => !data.node_ids.includes(node),
        );
        return filtered;
    };

    return func;
}

function get_reachable_nodes_filter_func(
    data: ReachableFilterParamsI,
): FilterFunc {
    const func: FilterFunc = (graph) => {
        const filtered = findReachableNodes(graph, data.node_ids);
        return [...filtered];
    };
    return func;
}

function get_reaching_nodes_filter_func(
    data: ReachingFilterParamsI,
): FilterFunc {
    const func: FilterFunc = (graph) => {
        const filtered = findReachingNodes(graph, data.node_ids);
        return [...filtered];
    };
    return func;
}

function get_no_outgoing_nodes_filter_func(
    data: NoOutgoingFilterParamsI,
): FilterFunc {
    const func: FilterFunc = (graph) => {
        const result = new Set<string>();
        graph.forEachNode((node) => {
            if (graph.outDegree(node) === 0) {
                result.add(node);
            }
        });
        return Array.from(result);
    };
    return func;
}

/* ---------------------------------------------------------------------

   ---------------------------------------------------------------------   */

// Factory function
export function filterFunctionFactory(params: FilterParamsI): FilterFunc {
    switch (params.type) {
        case "regex":
            return get_regex_filter_func(params);

        case "node_outgoing":
            return get_outgoing_node_filter_func(params);

        case "node_incoming":
            return get_incoming_node_filter_func(params);

        case "node_siblings":
            return get_node_siblings_filter_func(params);

        case "node_neighbours": // incoming + outgoing
            return get_node_neighbours_filter_func(params);

        case "node_selection":
            return get_node_selection_filter_func(params);

        case "inverse_node_selection":
            return get_inverse_selection_node_filter_func(params);

        case "reachable":
            return get_reachable_nodes_filter_func(params);

        case "reaching":
            return get_reaching_nodes_filter_func(params);

        case "algorithm_no_outgoing":
            return get_no_outgoing_nodes_filter_func(params);

        case "node_type":
            return get_node_type_filter(params);

        default:
            return () => [];
    }
}

export function apply_filters(graph: Graph, filters: FilterI[]) {
    let remaining_nodes = new Set(graph.nodes());
    let hidden_nodes: Set<string> = new Set();
    let shown_nodes: Set<string> = new Set();

    for (const filter of filters) {
        if (!filter.applied) continue;

        const filter_func = filterFunctionFactory(filter.data);
        let filtered_nodes = new Set(filter_func(graph));
        filtered_nodes.intersection(remaining_nodes);

        if (filter.show) {
            shown_nodes = shown_nodes.union(filtered_nodes);
        } else {
            hidden_nodes = hidden_nodes.union(filtered_nodes);
        }
        remaining_nodes = remaining_nodes.difference(filtered_nodes);
    }

    shown_nodes = shown_nodes.union(remaining_nodes);
    return shown_nodes;
}

export function filtered_subgraph(graph: Graph, shown_nodes: Set<string>) {
    const graph2 = subgraph(graph, shown_nodes);
    return graph2;
}

/* ---------------------------------------------------------------------
        
   ---------------------------------------------------------------------   */

export function get_file_nodes(graph: Graph): string[] {
    const filter = filterFunctionFactory({
        type: "node_type",
        node_type: "file",
    });
    const file_nodes: string[] = filter(graph);
    return file_nodes;
}

export function get_folder_nodes(graph: Graph): string[] {
    const filter = filterFunctionFactory({
        type: "node_type",
        node_type: "folder",
    });
    const file_nodes: string[] = filter(graph);
    return file_nodes;
}

/* ---------------------------------------------------------------------
                    FILTER PARAMS BUILDERS
   ---------------------------------------------------------------------   */

export function regex_filter_params(pattern: string): RegexFilterParamsI {
    const filter: RegexFilterParamsI = {
        type: "regex",
        pattern,
    };
    return filter;
}

export function node_type_filter_params(
    node_type: string,
): NodeTypeFilterParamsI {
    const filter: NodeTypeFilterParamsI = {
        type: "node_type",
        node_type,
    };
    return filter;
}

export function node_selection_filter_params(
    node_ids: string[],
): NodeSelectionFilterParamsI {
    const filter: NodeSelectionFilterParamsI = {
        type: "node_selection",
        node_ids,
    };
    return filter;
}

export function inverse_node_selection_filter_params(
    node_ids: string[],
): InverseNodeSelectionFilterParamsI {
    const filter: InverseNodeSelectionFilterParamsI = {
        type: "inverse_node_selection",
        node_ids,
    };
    return filter;
}

export function outgoing_node_filter_params(
    node_ids: string[],
): OutgoingNodeFilterParamsI {
    const filter: OutgoingNodeFilterParamsI = {
        type: "node_outgoing",
        node_ids,
    };
    return filter;
}

export function incoming_node_filter_params(
    node_ids: string[],
): IncomingNodeFilterParamsI {
    const filter: IncomingNodeFilterParamsI = {
        type: "node_incoming",
        node_ids,
    };
    return filter;
}

export function node_siblings_filter_params(
    node_ids: string[],
): NodeSiblingsFilterParamsI {
    const filter: NodeSiblingsFilterParamsI = {
        type: "node_siblings",
        node_ids,
    };
    return filter;
}

export function node_neighbours_filter_params(
    node_ids: string[],
): NodeNeighboursFilterParamsI {
    const filter: NodeNeighboursFilterParamsI = {
        type: "node_neighbours",
        node_ids,
    };
    return filter;
}

export function reachable_filter_params(
    node_ids: string[],
): ReachableFilterParamsI {
    const filter: ReachableFilterParamsI = {
        type: "reachable",
        node_ids,
    };
    return filter;
}

export function reaching_filter_params(
    node_ids: string[],
): ReachingFilterParamsI {
    const filter: ReachingFilterParamsI = {
        type: "reaching",
        node_ids,
    };
    return filter;
}

export function create_filter(
    label: string,
    show: boolean,
    params: FilterParamsI,
): FilterI {
    const id = uniqueId("filter_");
    const filter: FilterI = {
        id,
        label,
        show,
        applied: true,
        data: params,
    };
    return filter;
}
