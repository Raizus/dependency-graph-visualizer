import { NodeAttributesI } from "#models/schema.js";

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

