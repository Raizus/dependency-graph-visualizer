import type {
    ClusterI,
    ClustersI,
    Graph,
    NodeAttributesI,
} from "@dep-graph-vis/core";

export type TreeNode =
    | { kind: "cluster"; cluster: ClusterI; children: TreeNode[] }
    | { kind: "node"; id: string; attrs: NodeAttributesI };

function getMemberNodes(graph: Graph, cluster: ClusterI): TreeNode[] {
    const memberNodes: TreeNode[] = cluster.nodes.map((nid): TreeNode => {
        const attrs: NodeAttributesI = graph?.hasNode(nid)
            ? graph.getNodeAttributes(nid)
            : {
                  key: nid,
                  label: nid,
                  full_path: nid,
                  type: "unknown",
              };
        return { kind: "node", id: nid, attrs };
    });

    return memberNodes;
}

function getUsedClusters(graph: Graph, clusters: ClustersI): Set<string> {
    const cluster_ids: Set<string> = new Set();

    // if cluster is collapsed, then the graph has a node with the cluster id
    // if not, cluster is expanded or does not appear in the graph at all

    for (const node of graph.nodes()) {
        let c_id: string | undefined;
        if (clusters.hasCluster(node)) {
            c_id = node;
        } else if (clusters.hasNode(node)) {
            const node_parent = clusters.findClusterWithNode(node);
            if (node_parent) c_id = node_parent;
        }
        // else unclustered node -> not shown in tree

        if (!c_id || cluster_ids.has(c_id)) continue;

        // add cluster ids and parent
        cluster_ids.add(c_id);
        let parent_id = clusters.getParentCluster(c_id);
        while (parent_id && !cluster_ids.has(parent_id)) {
            cluster_ids.add(parent_id);
            parent_id = clusters.getParentCluster(parent_id);
        }
    }

    return cluster_ids;
}

export function buildTree(
    graph: Graph,
    clusters: ClustersI,
    parentId?: string,
): TreeNode[] {
    // note: if a node or cluster is in the graph, then all the parent clusters
    // will also be in the tree

    // construct a list of the actual clusters that are in the graph
    const used_clusters: Set<string> = getUsedClusters(graph, clusters);

    function _buildTree(parentId?: string): TreeNode[] {
        const childClusterIds = clusters.getDirectSubclusters(parentId);

        const result = childClusterIds
            .map((c_id): TreeNode | null => {
                if (!used_clusters.has(c_id)) return null; // not in the graph

                const cluster = clusters.getCluster(c_id);
                if (!cluster) return null;

                const memberNodes = getMemberNodes(graph, cluster);

                const subClusters = _buildTree(c_id);
                return {
                    kind: "cluster",
                    cluster,
                    children: [...subClusters, ...memberNodes],
                };
            })
            .filter(Boolean) as TreeNode[];
        
        return result;
    }

    return _buildTree(undefined);
}
