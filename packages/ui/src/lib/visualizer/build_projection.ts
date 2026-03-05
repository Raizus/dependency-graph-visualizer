import {
    type Graph,
    type LayoutResult,
    type NodeAttributesI,
} from "@dep-graph-vis/core";
import { type Node, type Edge, type Options } from "vis-network";
import { DataSet } from "vis-data";

function default_group(node: NodeAttributesI): string | undefined {
    if (node.type === "root") return "root";
    if (node.type === "file") return "file";
    if (node.type === "folder") return "folder";
    if (node.type === "cluster") return "cluster";
    return undefined;
}

export function build_nodes(
    graph: Graph,
    layout?: LayoutResult,
): DataSet<Node> {
    const nodes: Node[] = [];

    // construct node object
    graph.forEachNode((nodeKey, attributes) => {
        nodes.push({
            id: nodeKey,
            label: attributes.label ?? String(nodeKey),

            // tooltip
            title: `${nodeKey}: ${attributes.type}, ${attributes.full_path}`,
            group: default_group(attributes),
            // color: attributes.color,
        });
    });

    if (!layout) return new DataSet<Node>(nodes);

    // set fixed node position if layout is provided
    nodes.forEach((node) => {
        const node_id = node.id as string;
        const pos = layout.nodePositions.get(node_id);
        if (!pos) return;

        node.x = pos.x;
        node.y = pos.y;
        node.fixed = { x: true, y: true }; // Fix position
    });

    return new DataSet<Node>(nodes);
}

export function build_edges(graph: Graph): DataSet<Edge> {
    const edges: Edge[] = [];

    graph.forEachEdge((edgeKey, attributes, source, target) => {
        edges.push({
            id: edgeKey,
            from: source,
            to: target,

            // Optional:
            // label: attributes.label,
            // arrows: "to",
            // dashes: attributes.dashed,
        });
    });

    return new DataSet<Edge>(edges);
}

export function visnetwork_build_projection(
    graph: Graph,
    layout?: LayoutResult,
) {
    const nodes = build_nodes(graph, layout);
    const edges = build_edges(graph);

    // create a network
    const data = {
        nodes: nodes,
        edges: edges,
    };

    return data;
}

export function default_groups() {
    const groups = {
        folder: { color: { background: "#77ff65" } },
        root: { color: { background: "#77ff65" } },
        file: { color: { background: "#6495ff" } },
        cluster: {
            shape: "box",
            color: { background: "#ff6464" },
            font: { align: "center" },
        },
    };
    return groups;
}

export function default_visnetwork_options(): Options {
    const options: Options = {
        edges: {
            arrows: "to",
            smooth: true,
        },
        interaction: {
            multiselect: true,
            hover: true,
        },
        nodes: {
            title: "Hover",
        },
        layout: {
            improvedLayout: true,
        },
        physics: {
            enabled: true,

            solver: "barnesHut",

            barnesHut: {
                gravitationalConstant: -3000,
                centralGravity: 0.3,
                springLength: 95,
                springConstant: 0.04,
                damping: 0.7,
                avoidOverlap: 0.8,
            },

            stabilization: {
                enabled: true,
                iterations: 1000,
                updateInterval: 25,
                fit: true,
            },
        },
        groups: default_groups(),
    };
    return options;
}
