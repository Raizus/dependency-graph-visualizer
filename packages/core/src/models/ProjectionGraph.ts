import { DirectedGraph } from "graphology";
import { ClustersI, Graph, NodeAttributesI } from "./schema";

export function createProjectionGraph(graph: Graph, clusters: ClustersI) {
    const node_id_to_render_id_map = clusters.getIdToRendedIdMap(graph);
    const render_ids = new Set<string>();

    // find which graph nodes to render
    graph.forEachNode((node_id) => {
        const render_id = node_id_to_render_id_map.get(node_id);
        if (render_id) render_ids.add(render_id);
    });

    // find which cluster nodes to render
    for (const cluster of clusters.getAllClusters()) { 
        const render_id = node_id_to_render_id_map.get(cluster.id);
        if (render_id && !cluster.expanded) render_ids.add(render_id);
    }

    const proj_graph = new DirectedGraph<NodeAttributesI>({});

    // add base nodes
    graph.forEachNode((node_id, attributes) => {
        if (render_ids.has(node_id)) {
            proj_graph.addNode(node_id, attributes);
        }
    });

    // add cluster nodes
    for (const cluster of clusters.getAllClusters()) {
        if (!render_ids.has(cluster.id)) continue;

        const attr: NodeAttributesI = {
            id: cluster.id,
            label: cluster.label,
            type: "cluster",
            full_path: "",
            external: false,
        };
        proj_graph.addNode(cluster.id, attr);
    }

    graph.forEachEdge((edgeKey, attrs, source, target) => {
        const from = node_id_to_render_id_map.get(source);
        const to = node_id_to_render_id_map.get(target);

        if (!proj_graph.hasEdge(from, to) && from !== to) {
            proj_graph.addEdge(from, to);
        }
    });

    return proj_graph;
}
