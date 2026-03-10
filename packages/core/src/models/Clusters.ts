import { DirectedGraph } from "graphology";
import {
    ClusterBox,
    ClusterI,
    ClustersI,
    Graph,
    NodeAttributesI,
    NodeTypeFilterParamsI,
} from "./schema";
import { filterFunctionFactory } from "./Filters";
import { getPathToNodesMap } from "./Graph";

type ClustersMap = Map<string, ClusterI>;

export function buildHierarquicalClusters(graph: Graph): Map<string, ClusterI> {
    const root = graph.findNode(
        (node) => graph.getNodeAttribute(node, "type") === "root",
    );
    if (!root) return new Map();

    let count = 1;
    const cluster_map: Map<string, ClusterI> = new Map();
    const visited: Set<string> = new Set();

    function create_cluster(
        nattr: NodeAttributesI,
        parent_cluster_id: string | undefined,
    ): ClusterI {
        const ntype = nattr.type;
        const cluster_id = `c${count}`;
        const cluster: ClusterI = {
            id: cluster_id,
            nodes: [],
            expanded: ntype === "folder" ? true : false,
            // expanded: false,
            label: nattr.label,
            parent_id: parent_cluster_id,
        };
        count += 1;
        cluster_map.set(cluster_id, cluster);

        return cluster;
    }

    function is_cluster(ntype: string) {
        return (
            ntype === "file" ||
            ntype === "folder" ||
            ntype === "class" ||
            ntype === "external_library"
        );
    }

    function build_clusters(
        parent_cluster_id: string | undefined,
        parent_node: string,
    ) {
        if (visited.has(parent_node)) return;
        visited.add(parent_node);

        const parent_attr = graph.getNodeAttributes(parent_node);
        const parent_path = parent_attr.full_path;

        let new_parent_cluster_id = parent_cluster_id;
        // build cluster?
        if (parent_node !== root && is_cluster(parent_attr.type)) {
            const cluster = create_cluster(parent_attr, parent_cluster_id);
            cluster.nodes = [parent_node];
            new_parent_cluster_id = cluster.id;
        }
        // add node to parent cluster
        else if (parent_cluster_id) {
            const parent_cluster = cluster_map.get(parent_cluster_id);
            parent_cluster?.nodes.push(parent_node);
        }

        const outgoing = graph.outNeighbors(parent_node);
        for (const node of outgoing) {
            const nattr = graph.getNodeAttributes(node);

            // node does not belong to this cluster
            if (
                parent_node !== root &&
                !nattr.full_path.startsWith(parent_path)
            )
                continue;

            build_clusters(new_parent_cluster_id, node);
        }
    }

    // this will only create the file tree and will not create external library clusters
    build_clusters(undefined, root);

    // add clusters for external libraries
    const filter_data: NodeTypeFilterParamsI = {
        type: "node_type",
        node_type: "external_library",
    };
    const filter = filterFunctionFactory(filter_data);
    const external_lib_nodes = filter(graph);
    for (const node of external_lib_nodes) {
        build_clusters(undefined, node);
    }

    return cluster_map;
}

function getCollapsedClusters(clusters: ClustersMap): Set<string> {
    const collapsed = clusters
        .values()
        .filter((c) => !c.expanded)
        .map((c) => c.id);
    return new Set(collapsed);
}

function getExpandedClusters(clusters: ClustersMap) {
    const expanded = clusters
        .values()
        .filter((c) => c.expanded)
        .map((c) => c.id);
    return new Set(expanded);
}

function getAllClusterNodes(
    cluster: ClusterI,
    clusters: ClustersMap,
): string[] {
    const allNodes = new Set<string>();

    // Add direct members
    cluster.nodes.forEach((nodeId) => allNodes.add(nodeId));

    // Add nodes from child clusters
    const childClusters = clusters
        .values()
        .filter((c) => c.parent_id === cluster.id);

    for (const child of childClusters) {
        getAllClusterNodes(child, clusters).forEach((nodeId) =>
            allNodes.add(nodeId),
        );
    }

    return Array.from(allNodes);
}

function expandAllClusters(clusters: ClustersMap) {
    const expanded: Set<string> = new Set();
    for (const cluster of clusters.values()) {
        if (cluster.expanded) continue;

        expanded.add(cluster.id);
        cluster.expanded = true;
    }
    return expanded;
}

function collapseAllClusters(clusters: ClustersMap) {
    const collapsed: Set<string> = new Set();
    for (const cluster of clusters.values()) {
        if (!cluster.expanded) continue;

        collapsed.add(cluster.id);
        cluster.expanded = false;
    }
    return collapsed;
}

interface ClusterTreeNodeAttributes {
    cluster: ClusterI;
    // Direct member nodes (not recursive)
    memberNodes: Set<string>;
}

export class ClusterManager implements ClustersI {
    private _clusters: Map<string, ClusterI>;
    private clusterTree: DirectedGraph<ClusterTreeNodeAttributes>;
    private _nodeToCluster: Map<string, string>; // Maps node ID to its direct parent cluster
    private _idCounter: number;

    // Virtual root for top-level clusters
    private static readonly ROOT_ID = "__ROOT__";

    constructor(initialClusters: ClusterI[] = []) {
        this._clusters = new Map();
        this.clusterTree = new DirectedGraph();
        this._nodeToCluster = new Map();
        this._idCounter = 0;

        // Add virtual root node
        this.clusterTree.addNode(ClusterManager.ROOT_ID, {
            cluster: {
                id: ClusterManager.ROOT_ID,
                label: "Root",
                nodes: [],
                expanded: true,
            },
            memberNodes: new Set(),
        });

        // Add initial clusters
        initialClusters.forEach((cluster) => {
            this._addExistingCluster(cluster);
        });
    }

    /**
     * Generate a unique cluster ID
     */
    private generateId(): string {
        return `cluster_${++this._idCounter}`;
    }

    /**
     * Add a cluster that already has an ID (for initialization)
     */
    private _addExistingCluster(cluster: ClusterI): void {
        // Update counter if needed
        const match = cluster.id.match(/cluster_(\d+)/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num >= this._idCounter) {
                this._idCounter = num;
            }
        }

        this._clusters.set(cluster.id, cluster);

        // Add to tree
        this.clusterTree.addNode(cluster.id, {
            cluster,
            memberNodes: new Set(cluster.nodes),
        });

        // Connect to parent (or root)
        const parent_id = cluster.parent_id || ClusterManager.ROOT_ID;
        if (this.clusterTree.hasNode(parent_id)) {
            this.clusterTree.addEdge(parent_id, cluster.id);
        }

        // Update node-to-cluster mapping
        cluster.nodes.forEach((nodeId) => {
            this._nodeToCluster.set(nodeId, cluster.id);
        });
    }

    /**
     * Add a new cluster
     */
    addCluster(
        label: string,
        parent_id: string | undefined,
        nodes: string[],
        expanded: boolean = true,
    ): ClusterI {
        const id = this.generateId();

        const cluster: ClusterI = {
            id,
            label,
            parent_id: parent_id,
            nodes: [...nodes],
            expanded,
        };

        this._addExistingCluster(cluster);

        return cluster;
    }

    entries(): MapIterator<[string, ClusterI]> {
        return this._clusters.entries();
    }

    /**
     * Remove a cluster and optionally reassign its nodes
     */
    removeCluster(cluster_id: string): void {
        if (!this.hasCluster(cluster_id)) return;

        const cluster = this._clusters.get(cluster_id)!;

        // Get all child clusters
        const children = this.getDirectSubclusters(cluster_id);

        // Remove child clusters recursively
        children.forEach((child_id) => this.removeCluster(child_id));

        // Remove node mappings
        cluster.nodes.forEach((node_id) => {
            this._nodeToCluster.delete(node_id);
        });

        // Remove from tree
        this.clusterTree.dropNode(cluster_id);

        // Remove from map
        this._clusters.delete(cluster_id);
    }

    /**
     * Check if cluster exists
     */
    hasCluster(cluster_id: string): boolean {
        return this._clusters.has(cluster_id);
    }

    /**
     * Check if a node is in any cluster
     */
    hasNode(node_id: string): boolean {
        return this._nodeToCluster.has(node_id);
    }

    /**
     * Move a node from its current cluster to a target cluster
     */
    moveNode(node_id: string, target_cluster_id: string): boolean {
        if (!this.hasCluster(target_cluster_id)) return false;

        const sourceClusterId = this._nodeToCluster.get(node_id);

        // Remove from source cluster if exists
        if (sourceClusterId) {
            const sourceCluster = this._clusters.get(sourceClusterId)!;
            sourceCluster.nodes = sourceCluster.nodes.filter(
                (id) => id !== node_id,
            );

            // Update tree node
            const sourceTreeNode =
                this.clusterTree.getNodeAttributes(sourceClusterId);
            sourceTreeNode.memberNodes.delete(node_id);
        }

        // Add to target cluster
        const targetCluster = this._clusters.get(target_cluster_id)!;
        targetCluster.nodes.push(node_id);

        // Update tree node
        const targetTreeNode =
            this.clusterTree.getNodeAttributes(target_cluster_id);
        targetTreeNode.memberNodes.add(node_id);

        // Update mapping
        this._nodeToCluster.set(node_id, target_cluster_id);

        return true;
    }

    /**
     * Get mapping from graph node ID and cluster id to the lowest-rank collapsed parent cluster
     * If no collapsed parent, node maps to itself
     */
    getIdToRendedIdMap(graph: Graph): Map<string, string> {
        const mapping = new Map<string, string>();

        // For each node in the graph
        graph.forEachNode((nodeId) => {
            // Find the lowest-rank collapsed cluster containing this node
            const clusterId = this._findLowestCollapsedCluster(nodeId);
            mapping.set(nodeId, clusterId || nodeId);
        });

        // add mapping for cluster nodes themselves (if they are rendered)
        this._clusters.forEach((cluster) => {
            const cluster_parent_id = this._findLowestCollapsedCluster(
                cluster.id,
            );
            mapping.set(cluster.id, cluster_parent_id || cluster.id);
        });

        return mapping;
    }

    /**
     * Helper: Find the lowest-rank (shallowest) collapsed cluster containing a node
     */
    private _findLowestCollapsedCluster(node_id: string): string | null {
        // Start with the direct parent cluster
        let currentClusterId = this._nodeToCluster.get(node_id);
        let lowestCollapsed: string | null = null;

        // nodeToCluster only maps base nodes
        if (!currentClusterId && this.hasCluster(node_id)) {
            currentClusterId = node_id;
        }

        // Walk up the cluster tree
        while (currentClusterId) {
            const cluster = this.getCluster(currentClusterId);
            if (!cluster) break;

            // If this cluster is collapsed, it's a candidate
            if (!cluster.expanded) {
                lowestCollapsed = currentClusterId;
            }

            // Move to parent
            currentClusterId = cluster.parent_id;
        }

        return lowestCollapsed;
    }

    /**
     * Get all nodes that are members of any cluster (recursive)
     */
    getAllClusterNodesRecursive(): Set<string> {
        const allNodes = new Set<string>();

        this._clusters.forEach((cluster) => {
            cluster.nodes.forEach((nodeId) => allNodes.add(nodeId));
        });

        return allNodes;
    }

    /**
     * Find the direct parent cluster of a node
     */
    findClusterWithNode(node_id: string): string | null {
        return this._nodeToCluster.get(node_id) || null;
    }

    /**
     * Get all nodes in a cluster (including from subclusters, recursively)
     */
    getClusterNodes(cluster_id: string): Set<string> {
        if (!this.hasCluster(cluster_id)) return new Set();

        const allNodes = new Set<string>();

        // Add direct member nodes
        const cluster = this._clusters.get(cluster_id)!;
        cluster.nodes.forEach((nodeId) => allNodes.add(nodeId));

        // Recursively add nodes from subclusters
        const subclusters = this.getDirectSubclusters(cluster_id);
        subclusters.forEach((subclusterId) => {
            const subnodes = this.getClusterNodes(subclusterId);
            subnodes.forEach((nodeId) => allNodes.add(nodeId));
        });

        return allNodes;
    }

    /**
     * Get immediate child clusters
     */
    getDirectSubclusters(cluster_id?: string): string[] {
        // undefined cluster id -> root
        if (!cluster_id) cluster_id = ClusterManager.ROOT_ID;

        if (!this.clusterTree.hasNode(cluster_id)) return [];

        return this.clusterTree.outNeighbors(cluster_id);
    }

    getSubclustersRecursive(cluster_id?: string): string[] {
        const clusters: string[] = [];
        if (!cluster_id) return clusters;

        for (const sub_cluster of this.getDirectSubclusters(cluster_id)) {
            clusters.push(sub_cluster);
            const other_sub_clusters = this.getSubclustersRecursive(sub_cluster);
            other_sub_clusters.forEach(sub_sub_cluster => clusters.push(sub_sub_cluster));
        }

        return clusters;
    }

    /**
     * Get all parent clusters up to root
     */
    getParentClusters(cluster_id: string): string[] {
        const parents: string[] = [];

        let currentId = cluster_id;
        while (currentId) {
            const cluster = this._clusters.get(currentId);
            if (!cluster?.parent_id) break;

            parents.push(cluster.parent_id);
            currentId = cluster.parent_id;
        }

        return parents;
    }

    /**
     * Get all expanded clusters
     */
    getExpandedClusters(): Set<string> {
        return getExpandedClusters(this._clusters);
    }

    getCollapsedClusters(): Set<string> {
        return getCollapsedClusters(this._clusters);
    }

    collapseAllClusters(): Set<string> {
        return collapseAllClusters(this._clusters);
    }

    expandAllClusters(): Set<string> {
        return expandAllClusters(this._clusters);
    }

    /**
     * Expand a specific cluster
     */
    expandCluster(cluster_id: string): boolean {
        const cluster = this._clusters.get(cluster_id);
        if (!cluster) return false;

        if (!cluster.expanded) {
            cluster.expanded = true;
            return true;
        }

        return false;
    }

    /**
     * Collapse a specific cluster
     */
    collapseCluster(cluster_id: string): boolean {
        const cluster = this._clusters.get(cluster_id);
        if (!cluster) return false;

        if (cluster.expanded) {
            cluster.expanded = false;
            return true;
        }

        return false;
    }

    /**
     * Get cluster rank (depth in cluster tree)
     */
    getClusterRank(cluster: ClusterI): number {
        let rank = 0;
        let currentId = cluster.parent_id;

        while (currentId && currentId !== ClusterManager.ROOT_ID) {
            rank++;
            const parent = this._clusters.get(currentId);
            currentId = parent?.parent_id;
        }

        return rank;
    }

    /**
     * Get a specific cluster
     */
    getCluster(cluster_id: string): ClusterI | undefined {
        return this._clusters.get(cluster_id);
    }

    /**
     * Get all clusters
     */
    getAllClusters(): ClusterI[] {
        return Array.from(this._clusters.values());
    }
}

export function generateClusterBoxes(clusters: ClustersI): ClusterBox[] {
    const boxes: ClusterBox[] = [];

    // for (const [cluster_id, cluster] of clusters.entries()) {
    //     const nodes = clusters.get
    // }

    return boxes;
}

function createAutomaticClusters(graph: Graph): ClusterI[] {
    const clusters: ClusterI[] = [];

    const path_to_nodes = getPathToNodesMap(graph); // path -> node IDs
    const path_sep_re = /[\/\\:]+/; // path separator regex
    // Create cluster hierarchy
    let idCounter = 0;

    // Sort paths by depth (shallowest first for proper parent assignment)
    const sorted_paths = Array.from(path_to_nodes.keys()).sort((a, b) => {
        return a.split(path_sep_re).length - b.split(path_sep_re).length;
    });

    const pathToClusterId = new Map<string, string>();
    for (const path of sorted_paths) {
        const nodes = path_to_nodes.get(path)!;

        // Find parent cluster
        const parent_path = path.split(path_sep_re).slice(0, -1).join("/");
        const parent_id = pathToClusterId.get(parent_path);

        const cluster_id = `cluster_${idCounter++}`;
        pathToClusterId.set(path, cluster_id);

        // add new cluster
        clusters.push({
            id: cluster_id,
            label: path.split(path_sep_re).pop() || path,
            parent_id: parent_id,
            nodes: nodes,
            expanded: false, // Start collapsed
        });
    }

    return clusters;
}
