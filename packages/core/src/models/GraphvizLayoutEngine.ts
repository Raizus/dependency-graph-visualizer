import { Graphviz } from "@hpcc-js/wasm";
import {
    digraph,
    attribute as attr,
    toDot,
    RootGraphModel,
    SubgraphModel,
    NodeAttributesObject,
    GraphAttributesObject,
    EdgeAttributesObject,
    SubgraphAttributesObject,
} from "ts-graphviz";
import { Graph, ClustersI, NodeAttributesI, LayoutI } from "./schema";

export interface LayoutPosition {
    x: number;
    y: number;
}

export interface LayoutResult {
    // Node positions in pixels
    nodePositions: Map<string, LayoutPosition>;

    // Cluster box bounds (for expanded clusters)
    clusterBounds: Map<
        string,
        {
            x: number;
            y: number;
            width: number;
            height: number;
        }
    >;

    // Graph dimensions
    width: number;
    height: number;
}

function clusterNodeStyle(): NodeAttributesObject {
    return {
        shape: "cylinder",
        style: "filled,rounded",
        fillcolor: "#e8f4f8",
        color: "#3498db",
        penwidth: 2,
    };
}

function clusterBoxStyle(): SubgraphAttributesObject {
    return {
        style: "rounded",
        color: "#3498db",
        fontcolor: "#cecece"
    };
}

function getNodeShape(type: string): string {
    const shapes: Record<string, string> = {
        file: "tab",
        folder: "folder",
        root: "folder",
        class: "component",
        function: "ellipse",
        method: "ellipse",
        cluster: "cylinder",
    };

    return shapes[type] || "ellipse";
}

function getNodeColor(type: string): string {
    const colors: Record<string, string> = {
        file: "#e8f4f8",
        folder: "#fff9e6",
        class: "#f0e6ff",
        function: "#e6f7ff",
        method: "#e6f7ff",
        cluster: "#ffe6e6",
    };

    return colors[type] || "#f5f5f5";
}

function baseNodeStyle(attrs: NodeAttributesI): NodeAttributesObject {
    return {
        shape: getNodeShape(attrs.type),
        style: "filled",
        fillcolor: getNodeColor(attrs.type),
    };
}

function getEdgeStyle(): EdgeAttributesObject { 
    return {
        color: "#bfbfbf",
    };
}

interface GraphOptions {
    graphAttrs?: GraphAttributesObject;
    nodeAttrs?: NodeAttributesObject;
    edgeAttrs?: EdgeAttributesObject;
}

const DEFAULT_DOT_OPTIONS: GraphOptions = {
    graphAttrs: {
        bgcolor: "none",
        layout: "dot",
        rankdir: "TB",
        ranksep: 1.0,
        nodesep: 0.5,
        splines: "spline",
        newrank: true,
        compound: true,
    },

    edgeAttrs: {
        color: "#949494",
    },
};

const DEFAULT_FDP_OPTIONS: GraphOptions = {
    graphAttrs: {
        bgcolor: "none",
        layout: "fdp",
        splines: "curved", // or 'polyline'; 'ortho' doesn't work well with fdp
        overlap: "prism", // or 'false' to remove node overlap (can be slow on large graphs)
        sep: "+8", // extra space between nodes after overlap removal
        K: 0.6, // ideal edge length (spring constant) — lower = tighter
        maxiter: 1000, // max iterations for layout
        start: "", // or a seed number like 3 for reproducible layouts
    },

    edgeAttrs: {
        color: "#949494",
    },
};

const DEFAULT_SFDP_OPTIONS: GraphOptions = {
    graphAttrs: {
        bgcolor: "none",
        layout: "sfdp",

        // Graph-level
        splines: "curved",
        overlap: "prism", // sfdp has its own overlap handling, prism cleans it up after
        sep: "+8",
        K: 0.6, // spring constant, same as fdp
        repulsiveforce: 1.0, // increase to push nodes apart more (default is 1.0)
        smoothing: "triangle", // improves layout quality: 'none' | 'avg_dist' | 'graph_dist' | 'power_dist' | 'rng' | 'spring' | 'triangle'
        maxiter: 200,
    },

    edgeAttrs: {
        color: "#949494",
    },
};

const DEFAULT_EXPORT_DOT_OPTIONS: GraphOptions = {
    graphAttrs: {
        bgcolor: "#ffffff",
        layout: "dot",
        rankdir: "TB",
        ranksep: 1.0,
        nodesep: 0.5,
        splines: "spline",
        newrank: true,
        compound: true,
    },

    edgeAttrs: {
        color: "#000000",
    },
};

const DEFAULT_EXPORT_FDP_OPTIONS: GraphOptions = {
    graphAttrs: {
        bgcolor: "white",
        layout: "fdp",
        splines: "curved", // or 'polyline'; 'ortho' doesn't work well with fdp
        overlap: "prism", // or 'false' to remove node overlap (can be slow on large graphs)
        sep: "+8", // extra space between nodes after overlap removal
        K: 0.6, // ideal edge length (spring constant) — lower = tighter
        maxiter: 1000, // max iterations for layout
        start: "", // or a seed number like 3 for reproducible layouts
    },

    edgeAttrs: {
        color: "#000000",
    },
};

const DEFAULT_EXPORT_SFDP_OPTIONS: GraphOptions = {
    graphAttrs: {
        bgcolor: "white",
        layout: "sfdp",

        // Graph-level
        splines: "curved",
        overlap: "prism", // sfdp has its own overlap handling, prism cleans it up after
        sep: "+8",
        K: 0.6, // spring constant, same as fdp
        repulsiveforce: 1.0, // increase to push nodes apart more (default is 1.0)
        smoothing: "triangle", // improves layout quality: 'none' | 'avg_dist' | 'graph_dist' | 'power_dist' | 'rng' | 'spring' | 'triangle'
        maxiter: 200,
    },

    edgeAttrs: {
        color: "#000000",
    },
};

export function layoutToDotOptions(layout: LayoutI) {
    if (layout.type === "fdp") return DEFAULT_FDP_OPTIONS;
    if (layout.type === "sfdp") return DEFAULT_SFDP_OPTIONS;
    return DEFAULT_DOT_OPTIONS;
}

export function layoutToExportDotOptions(layout: LayoutI) {
    if (layout.type === "fdp") return DEFAULT_EXPORT_FDP_OPTIONS;
    if (layout.type === "sfdp") return DEFAULT_EXPORT_SFDP_OPTIONS;    
    return DEFAULT_EXPORT_DOT_OPTIONS;
}

/**
 * Builds the RootGraphModel from the base graph and clusters
 * to create the dot file
 */
class GraphvizGraphModelBuilder {
    static buildGraphvizGraphModel(
        graph: Graph,
        clusters: ClustersI,
        options: GraphOptions,
    ): RootGraphModel {
        const layout = options.graphAttrs?.layout || "dot";

        switch (layout) {
            case "fdp": {
                const g = GraphvizGraphModelBuilder.buildFdpLayoutGraphModel(
                    graph,
                    clusters,
                    options,
                );
                return g;
            }
            case "sfdp": {
                const g = GraphvizGraphModelBuilder.buildSfdpLayoutGraphModel(
                    graph,
                    clusters,
                    options,
                );
                return g;
            }
            default: {
                // dot
                const g = GraphvizGraphModelBuilder.buildDotLayoutGraphModel(
                    graph,
                    clusters,
                    options,
                );
                return g;
            }
        }
    }

    private static buildDotLayoutGraphModel(
        graph: Graph,
        clusters: ClustersI,
        options: GraphOptions,
    ) {
        // Create main digraph
        const g = digraph(
            "G",
            { layout: "dot", ...options.graphAttrs },
            (g) => {
                if (options.edgeAttrs) g.edge(options.edgeAttrs);

                // Build cluster hierarchy
                GraphvizGraphModelBuilder.addClustersToGraph(
                    g,
                    clusters,
                    graph,
                    undefined,
                    false,
                );

                // Add nodes that aren't in any cluster
                GraphvizGraphModelBuilder.addUnclusteredNodes(
                    g,
                    graph,
                    clusters,
                );

                // Add edges
                GraphvizGraphModelBuilder.addEdgesToGraph(g, graph, clusters);

                // set node graph ranks
                // rank graph nodes
                // const rank_to_nodes = buildNodeRankMap(graph);
                // for (const [rank, nodes] of rank_to_nodes.entries()) {
                //     if (nodes.length <= 1) continue;

                //     g.subgraph({ rank: "same" }, (s) => {
                //         for (const node of nodes) {
                //             s.node(node);
                //         }
                //     });
                // }
            },
        );

        return g;
    }

    private static buildFdpLayoutGraphModel(
        graph: Graph,
        clusters: ClustersI,
        options: GraphOptions,
    ) {
        // Create main digraph
        const g = digraph(
            "G",
            { layout: "fdp", ...options.graphAttrs },
            (g) => {
                // Build cluster hierarchy
                GraphvizGraphModelBuilder.addClustersToGraph(
                    g,
                    clusters,
                    graph,
                    undefined,
                    false,
                );

                // Add nodes that aren't in any cluster
                GraphvizGraphModelBuilder.addUnclusteredNodes(
                    g,
                    graph,
                    clusters,
                );

                // Add edges
                GraphvizGraphModelBuilder.addEdgesToGraph(g, graph, clusters);
            },
        );

        return g;
    }

    private static buildSfdpLayoutGraphModel(
        graph: Graph,
        clusters: ClustersI,
        options: GraphOptions,
    ) {
        // Create main digraph
        const g = digraph(
            "G",
            { layout: "sfdp", ...options.graphAttrs },
            (g) => {
                // Build cluster hierarchy
                GraphvizGraphModelBuilder.addClustersToGraph(
                    g,
                    clusters,
                    graph,
                    undefined,
                    false,
                );

                // Add nodes that aren't in any cluster
                GraphvizGraphModelBuilder.addUnclusteredNodes(
                    g,
                    graph,
                    clusters,
                );

                // Add edges
                GraphvizGraphModelBuilder.addEdgesToGraph(g, graph, clusters);
            },
        );

        return g;
    }

    private static addClustersToGraph(
        g: RootGraphModel | SubgraphModel,
        clusters: ClustersI,
        graph: Graph,
        parentId: string | undefined,
        rank_child_clusters: boolean,
    ): void {
        // Find clusters with this parent
        const child_clusters = clusters.getDirectSubclusters(parentId);

        const collapsed_clusters: string[] = [];

        for (const child_cluster_id of child_clusters) {
            const cluster = clusters.getCluster(child_cluster_id);

            if (!cluster) continue;

            // Collapsed cluster: add a single node representing the cluster
            // add the cluster box too
            const cluster_style = clusterBoxStyle();
            if (!cluster.expanded) {
                // make sure the filtered graph has the node
                const c_id = `${cluster.id}`;
                if (!graph.hasNode(c_id)) continue;

                g.subgraph(`cluster_${cluster.id}`, cluster_style, (sub) => {
                    sub.set(attr.label, cluster.label);

                    const node_attr = graph.getNodeAttributes(c_id);
                    sub.node(c_id, {
                        label: cluster.label,
                        ...clusterNodeStyle(),
                        tooltip: `${c_id}; type: ${node_attr.type}`,
                    });
                    collapsed_clusters.push(c_id);
                });

                continue;
            }

            // Expanded cluster: create subgraph
            g.subgraph(`cluster_${cluster.id}`, cluster_style, (sub) => {
                sub.set(attr.label, cluster.label);

                // Add nodes directly in this cluster
                for (const nodeId of cluster.nodes) {
                    if (!graph.hasNode(nodeId)) continue;

                    const attrs = graph.getNodeAttributes(nodeId);
                    sub.node(nodeId, {
                        label: attrs.label || attrs.key,
                        ...baseNodeStyle(attrs),
                        tooltip: `${nodeId}; path: ${attrs.full_path}`,
                    });
                }

                // Recursively add child clusters
                GraphvizGraphModelBuilder.addClustersToGraph(
                    sub,
                    clusters,
                    graph,
                    cluster.id,
                    rank_child_clusters,
                );
            });
        }

        // rank collapsed child cluster nodes with the same rank
        if (rank_child_clusters) {
            if (collapsed_clusters.length <= 1) return;
            g.subgraph({ rank: "same" }, (s) => {
                for (const c_id of collapsed_clusters) {
                    s.node(c_id);
                }
            });
        }
    }

    private static addUnclusteredNodes(
        g: RootGraphModel,
        graph: Graph,
        clusters: ClustersI,
    ): void {
        const clustered_nodes: Set<string> =
            clusters.getAllClusterNodesRecursive();

        // Add unclustered nodes
        graph.forEachNode((nodeId, attrs) => {
            if (!clustered_nodes.has(nodeId)) {
                g.node(nodeId, {
                    label: attrs.label || attrs.key,
                    ...baseNodeStyle(attrs),
                });
            }
        });
    }

    private static addEdgesToGraph(
        g: any,
        graph: Graph,
        clusters: ClustersI,
    ): void {
        graph.forEachEdge((edgeKey, attrs, source, target) => {
            // Check if source/target are in collapsed clusters

            const fromId = source;
            const toId = target;

            // Don't create self-loops
            if (fromId !== toId) {
                g.edge([fromId, toId], getEdgeStyle());
            }
        });
    }
}

export class GraphvizLayoutEngine {
    private graphviz: any | null = null;
    private initialized = false;

    is_initialized(): boolean {
        return this.initialized;
    }

    /**
     * Initialize Graphviz WASM
     */
    async initialize(): Promise<void> {
        if (this.is_initialized()) return;

        this.graphviz = await Graphviz.load();
        this.initialized = true;
    }

    /**
     * Compute layout for graph with clusters
     */
    async computeLayout(
        projection_graph: Graph,
        clusters: ClustersI,
        options: GraphOptions = DEFAULT_DOT_OPTIONS,
    ): Promise<LayoutResult> {
        if (!this.initialized) {
            await this.initialize();
        }

        // Build DOT representation
        const dot = this.buildDot(projection_graph, clusters, options);

        // Run Graphviz layout
        const svg = await this.computeSvg(dot);

        // Parse SVG to extract positions
        return this.parseSvgLayout(svg, projection_graph, clusters);
    }

    /**
     * Build DOT representation of graph with clusters
     */
    buildDot(
        graph: Graph,
        clusters: ClustersI,
        options: GraphOptions = DEFAULT_DOT_OPTIONS,
    ): string {
        const g = GraphvizGraphModelBuilder.buildGraphvizGraphModel(
            graph,
            clusters,
            options,
        );

        return toDot(g);
    }

    async computeSvg(dot: string): Promise<string> {
        const svg: string = await this.graphviz!.dot(dot);
        return svg;
    }

    /**
     * Parse SVG output from Graphviz to extract positions
     */
    private parseSvgLayout(
        svg: string,
        graph: Graph,
        clusters: ClustersI,
    ): LayoutResult {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, "image/svg+xml");

        const nodePositions = new Map<string, LayoutPosition>();
        const clusterBounds = new Map<string, any>();

        // Get graph dimensions
        const svgElement = doc.querySelector("svg");
        const viewBox = svgElement
            ?.getAttribute("viewBox")
            ?.split(" ")
            .map(Number);
        const width = viewBox ? viewBox[2] : 800;
        const height = viewBox ? viewBox[3] : 600;

        // Extract node positions
        // Graphviz outputs nodes as <g> elements with class="node"
        const nodeElements = doc.querySelectorAll(
            "g.node",
        ) as NodeListOf<SVGGElement>;

        nodeElements.forEach((nodeEl) => {
            const title = nodeEl.querySelector("title")?.textContent;
            if (!title) return;

            // get group element bounding box
            const bbox = nodeEl.getBBox();
            const x = bbox.x + bbox.width / 2;
            const y = bbox.y + bbox.height / 2;

            // Graphviz uses points (1/72 inch), convert to pixels
            // Also flip Y coordinate (SVG has Y increasing downward)
            nodePositions.set(title, {
                x: x,
                y: height - y, // Flip Y
            });
        });

        // Extract cluster bounds (subgraphs)
        const clusterElements = doc.querySelectorAll(
            "g.cluster",
        ) as NodeListOf<SVGGElement>;

        clusterElements.forEach((clusterEl) => {
            const title = clusterEl.querySelector("title")?.textContent;
            if (!title) return;

            // Remove "cluster_" prefix if present
            const clusterId = title.replace(/^cluster_/, "");

            const bbox = clusterEl.getBBox();
            const x = bbox.x;
            const y = bbox.y;
            const c_width = bbox.width;
            const c_height = bbox.height;

            clusterBounds.set(clusterId, {
                x,
                y: height - y, // Flip Y
                width: c_width,
                height: c_height,
            });
        });

        return {
            nodePositions,
            clusterBounds,
            width,
            height,
        };
    }
}
