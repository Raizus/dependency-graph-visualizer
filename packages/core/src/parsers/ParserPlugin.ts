import { DirectedGraph } from "graphology";
import { Graph, NodeAttributesI } from "../models";

export interface ParserSettings {
    ignore_path: string[];
    include_folder_nodes: boolean;
    include_file_nodes: boolean;
    include_external_nodes: boolean;
    exclude_external: string[];
}

export interface ParseResult {
    nodes: NodeAttributesI[];
    edges: Edge[];
}

export interface Edge {
    source: string; // node key
    target: string; // node key — may not yet exist in the graph
    label?: string;
    type?: string;
}

export interface ParserPlugin {
    supportedExtensions: string[];

    /**
     * Parses a single file and returns all nodes and edges declared within it.
     * Edges may reference nodes not yet present in the graph (forward references);
     * the orchestrator is responsible for resolving these after all files are parsed.
     */
    parseFile(
        filePath: string,
        content: string,
        settings: ParserSettings,
    ): ParseResult;
}

/**
 * Orchestrates parsing across all files and builds the final graph.
 * Handles forward references by collecting all results before adding edges.
 */
export function buildGraph(
    files: { path: string; content: string }[],
    plugin: ParserPlugin,
    settings: ParserSettings,
): Graph {
    const graph: Graph = new DirectedGraph<NodeAttributesI>();
    const allEdges: Edge[] = [];

    // First pass: parse all files, collect nodes and edges
    for (const file of files) {
        const { nodes, edges } = plugin.parseFile(
            file.path,
            file.content,
            settings,
        );

        for (const node of nodes) {
            if (!graph.hasNode(node.key)) {
                graph.addNode(node.key, node);
            }
        }

        allEdges.push(...edges);
    }

    // Second pass: add edges, with forward-reference resolution
    for (const edge of allEdges) {
        const sourceExists = graph.hasNode(edge.source);
        const targetExists = graph.hasNode(edge.target);

        if (!sourceExists || !targetExists) {
            if (settings.include_external_nodes) {
                // Add stub nodes for unresolved references (e.g. external libraries)
                if (!sourceExists) {
                    graph.addNode(edge.source, stubNode(edge.source));
                }
                if (!targetExists) {
                    graph.addNode(edge.target, stubNode(edge.target));
                }
            } else {
                // Drop edges to unknown nodes
                continue;
            }
        }

        graph.addEdge(edge.source, edge.target, {
            label: edge.label,
            type: edge.type,
        });
    }

    return graph;
}

function stubNode(key: string): NodeAttributesI {
    return {
        key,
        label: key.split("##").pop() ?? key,
        type: "unknown",
        external: true,
    };
}
