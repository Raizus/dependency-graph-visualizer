import DirectedGraph from "graphology";
import { Graph, GraphJSON, NodeAttributesI } from "./schema";

export function loadDirectedGraphFromJSON(
    data: GraphJSON,
): DirectedGraph<NodeAttributesI> {
    const graph = new DirectedGraph<NodeAttributesI>();

    // Add nodes
    for (const node of data.nodes) {
        if (graph.hasNode(node.id)) {
            throw new Error(`Duplicate node id: ${node.id}`);
        }

        graph.addNode(node.id, {
            id: node.id,
            label: node.label,
            full_path: node.full_path,
            type: node.type,
            external: node.external,
        });
    }

    // Add edges
    for (const edge of data.edges) {
        if (!graph.hasNode(edge.source)) {
            throw new Error(`Edge source does not exist: ${edge.source}`);
        }
        if (!graph.hasNode(edge.target)) {
            throw new Error(`Edge target does not exist: ${edge.target}`);
        }

        graph.addDirectedEdge(edge.source, edge.target);
    }

    return graph;
}

export function getPathRank(path: string): number {
    // Count depth in file tree
    // e.g., "src/utils/helper.ts::MyClass::myMethod" → rank 4
    const parts = path.split(/[\/\\:]+/);
    return parts.length;
}

/**
 * Returns a map of base paths to nodes (does not include external libraries)
 * @param graph 
 * @returns 
 */
export function getPathToNodesMap(graph: Graph): Map<string, string[]> {
    // Group nodes by their path structure
    const path_to_nodes = new Map<string, string[]>(); // path -> node IDs
    graph.forEachNode((nodeId, attrs) => {
        const type = attrs.type;
        const path = attrs.full_path;

        if (type === "folder") {
            // Folder cluster
            path_to_nodes.set(path, [nodeId]);
        } else if (type === "file") {
            // File cluster
            path_to_nodes.set(path, [nodeId]);
        } else if (type === "class") {
            const classPath = path;
            if (!path_to_nodes.has(classPath)) {
                path_to_nodes.set(classPath, []);
            }
            path_to_nodes.get(classPath)!.push(nodeId);
        }
    });

    return path_to_nodes;
}

export function assignNodeRanks(graph: Graph) {
    const path_to_nodes = getPathToNodesMap(graph); // path -> node IDs
    const path_sep_re = /[\/\\:]+/; // path separator regex

    // Sort paths by depth (shallowest first for proper parent assignment)
    const sorted_paths = Array.from(path_to_nodes.keys()).sort((a, b) => {
        return a.split(path_sep_re).length - b.split(path_sep_re).length;
    });

    for (const path of sorted_paths) {
        const nodes = path_to_nodes.get(path)!;
        const parts = path.split(path_sep_re);
        const rank = parts.length + 1;
        
        for (const node of nodes) {
            graph.setNodeAttribute(node, 'rank', rank)
        }
    }
}

/**
 * Group graph nodes by rank attribute
 * @param graph 
 * @returns map of rank to nodes
 */
export function buildNodeRankMap(graph: Graph): Map<number, string[]> {
    const rank_to_nodes_map = new Map<number, string[]>();
    graph.forEachNode((node) => {
        const rank = graph.getNodeAttribute(node, "rank");
        if (rank === undefined) return;

        const nodes = rank_to_nodes_map.get(rank);
        if (nodes === undefined) {
            rank_to_nodes_map.set(rank, [node]);
        } else {
            nodes.push(node);
        }
    });

    return rank_to_nodes_map;
}

