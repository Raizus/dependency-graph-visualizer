import { ClusterBox, ClusterI, Graph } from "./schema";

export interface GraphPipelineResult {
    // The graph to actually render
    renderGraph: Graph;

    // Mapping from render node ID back to original node ID(s)
    // For cluster nodes, maps to array of contained node IDs
    nodeMapping: Map<string, string[]>;

    // Which nodes are visible after filtering
    visibleNodeIds: Set<string>;

    // Which clusters are collapsed
    collapsedClusters: Set<string>;
}

// /**
//  * Generate cluster box definitions for rendering
//  */
// function generateClusterBoxes(
//     visibleNodes: Set<string>,
//     nodeMapping: Map<string, string[]>,
// ): ClusterBox[] {
//     const boxes: ClusterBox[] = [];

//     for (const cluster of this.view.clusters) {
//         // Get all nodes that would be visible in this cluster
//         const clusterNodes = this.getAllClusterNodes(cluster).filter(
//             (nodeId) => {
//                 // Check if node is visible in render graph
//                 const renderId = Array.from(nodeMapping.entries()).find(
//                     ([_, nodes]) => nodes.includes(nodeId),
//                 )?.[0];
//                 return renderId && visibleNodes.has(renderId);
//             },
//         );

//         if (clusterNodes.length === 0) continue;

//         boxes.push({
//             clusterId: cluster.id,
//             label: cluster.label,
//             color: getClusterColor(cluster),
//             nodeIds: cluster.expanded ? clusterNodes : [cluster.id],
//             expanded: cluster.expanded || false,
//         });
//     }

//     return boxes;
// }

/**
 * Get color for cluster (can be customized)
 */
function getClusterColor(cluster: ClusterI): string {
    // You can customize this based on cluster properties
    const colors = [
        "#3498db", // blue
        "#2ecc71", // green
        "#e74c3c", // red
        "#f39c12", // orange
        "#9b59b6", // purple
        "#1abc9c", // turquoise
    ];

    // Simple hash of cluster ID to get consistent color
    const hash = cluster.id.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
}
