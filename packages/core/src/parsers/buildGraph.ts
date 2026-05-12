import { Graph, NodeAttributesI } from "#models/schema.js";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { resolve, relative, extname, dirname, basename } from "node:path";
import { createRequire } from "node:module";
const { DirectedGraph } = createRequire(import.meta.url)("graphology");
// import { DirectedGraph } from "graphology";
import { Edge, ParserPlugin, ParserSettings } from "./ParserPlugin";

// ── File discovery ────────────────────────────────────────────────────────────

function isIgnored(
    absPath: string,
    root: string,
    ignorePaths: string[],
): boolean {
    const rel = relative(root, absPath).replace(/\\/g, "/");
    // Always ignore hidden files/folders
    if (rel.split("/").some((part) => part.startsWith("."))) return true;
    return ignorePaths.some((p) => rel === p || rel.startsWith(p + "/"));
}

function collectFiles(
    dir: string,
    root: string,
    extensions: Set<string>,
    settings: ParserSettings,
): string[] {
    const results: string[] = [];
    for (const entry of readdirSync(dir)) {
        const abs = resolve(dir, entry);
        if (isIgnored(abs, root, settings.ignore_path)) continue;
        const stat = statSync(abs);
        if (stat.isDirectory()) {
            results.push(...collectFiles(abs, root, extensions, settings));
        } else if (extensions.has(extname(entry))) {
            results.push(abs);
        }
    }
    return results;
}

// ── Folder / file node helpers ────────────────────────────────────────────────

function addFolderNodes(
    filePath: string,
    root: string,
    graph: Graph,
    settings: ParserSettings,
): void {
    if (!settings.include_folder_nodes) return;
    let dir = dirname(filePath);
    while (dir !== root && dir.startsWith(root)) {
        const key = relative(root, dir).replace(/\\/g, "/");
        if (!graph.hasNode(key)) {
            graph.addNode(key, { key, label: basename(dir), type: "folder" });
        }
        // folder containment edge to parent
        const parentKey = relative(root, dirname(dir)).replace(/\\/g, "/");
        if (parentKey && !graph.hasEdge(parentKey, key)) {
            graph.addEdge(parentKey, key, { type: "contains" });
        }
        dir = dirname(dir);
    }
}

function addFileNode(
    filePath: string,
    root: string,
    graph: Graph,
    settings: ParserSettings,
): string {
    const key = relative(root, filePath).replace(/\\/g, "/");
    if (settings.include_file_nodes && !graph.hasNode(key)) {
        graph.addNode(key, { key, label: basename(filePath), type: "file" });
    }
    if (settings.include_folder_nodes) {
        const parentKey = relative(root, dirname(filePath)).replace(/\\/g, "/");
        if (
            parentKey &&
            graph.hasNode(parentKey) &&
            !graph.hasEdge(parentKey, key)
        ) {
            graph.addEdge(parentKey, key, { type: "contains" });
        }
    }
    return key;
}

// ── buildGraph ────────────────────────────────────────────────────────────────

/**
 * Discovers all supported files under `root`, parses them with the matching
 * plugin, and assembles a full dependency graph.
 */
export function buildGraph(
    root: string,
    plugins: ParserPlugin[],
    settings: ParserSettings,
): Graph {
    const graph: Graph = new DirectedGraph();
    const allEdges: Edge[] = [];

    // Index plugins by extension for O(1) lookup
    const pluginByExt = new Map<string, ParserPlugin>();
    for (const plugin of plugins) {
        for (const ext of plugin.supportedExtensions) {
            pluginByExt.set(ext, plugin);
        }
    }

    const supportedExtensions = new Set(pluginByExt.keys());
    const files = collectFiles(root, root, supportedExtensions, settings);

    // First pass: parse all files, collect nodes and edges
    for (const filePath of files) {
        addFolderNodes(filePath, root, graph, settings);
        addFileNode(filePath, root, graph, settings);

        const plugin = pluginByExt.get(extname(filePath))!;
        const content = readFileSync(filePath, "utf8");
        const { nodes, edges } = plugin.parseFile(filePath, content, settings);

        for (const node of nodes) {
            if (!graph.hasNode(node.key)) graph.addNode(node.key, node);
        }
        allEdges.push(...edges);
    }

    // Second pass: wire edges, resolve forward references
    for (const edge of allEdges) {
        if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) {
            if (settings.include_external_nodes) {
                if (!graph.hasNode(edge.source))
                    graph.addNode(edge.source, stubNode(edge.source));
                if (!graph.hasNode(edge.target))
                    graph.addNode(edge.target, stubNode(edge.target));
            } else {
                continue;
            }
        }
        // Avoid duplicate edges
        if (!graph.hasEdge(edge.source, edge.target)) {
            graph.addEdge(edge.source, edge.target, {
                label: edge.label,
                type: edge.type,
            });
        }
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
