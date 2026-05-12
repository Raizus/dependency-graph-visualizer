import { DirectedGraph } from "graphology";
import { Attributes } from "graphology-types";

export type RegexFilterParamsI = {
    type: "regex";
    pattern: string;
    flags?: string;
};
export type NodeTypeFilterParamsI = { type: "node_type"; node_type: string };

export type OutgoingNodeFilterParamsI = {
    type: "node_outgoing";
    node_ids: string[];
};
export type IncomingNodeFilterParamsI = {
    type: "node_incoming";
    node_ids: string[];
};
export type NodeSiblingsFilterParamsI = {
    type: "node_siblings";
    node_ids: string[];
};
export type NodeNeighboursFilterParamsI = {
    type: "node_neighbours";
    node_ids: string[];
};

export type NodeSelectionFilterParamsI = {
    type: "node_selection";
    node_ids: string[];
};
export type InverseNodeSelectionFilterParamsI = {
    type: "inverse_node_selection";
    node_ids: string[];
};

export type ReachableFilterParamsI = {
    type: "reachable";
    node_ids: string[];
};
export type ReachingFilterParamsI = {
    type: "reaching";
    node_ids: string[];
};

export type PathsBetweenFilterParamsI = {
    type: "paths_between";
    sourceIds: string[];
    targetIds: string[];
};
export type PathsFromFilterParamsI = { type: "paths_from"; nodeIds: string[] };
export type PathsToFilterParamsI = { type: "paths_to"; nodeIds: string[] };
export type NoOutgoingFilterParamsI = { type: "algorithm_no_outgoing" };

export type FilterParamsI =
    | RegexFilterParamsI
    | NodeTypeFilterParamsI
    | OutgoingNodeFilterParamsI
    | IncomingNodeFilterParamsI
    | NodeSiblingsFilterParamsI
    | NodeNeighboursFilterParamsI
    | NodeSelectionFilterParamsI
    | InverseNodeSelectionFilterParamsI
    | ReachableFilterParamsI
    | ReachingFilterParamsI
    | PathsBetweenFilterParamsI
    | PathsFromFilterParamsI
    | PathsToFilterParamsI
    | NoOutgoingFilterParamsI;

export interface FilterI {
    label: string;
    show: boolean;
    applied: boolean;
    data: FilterParamsI;
}

export interface NodeGroupI {
    filters: FilterI[];
    color: string;
    text_color: string;
}

export type LayoutType = "dot" | "fdp" | "sfdp" | "twopi";

export interface LayoutI {
    type: LayoutType;
}

export interface GraphAttributesI { 
    name?: string;
}

export interface NodeAttributesI {
    key: string;
    label: string;
    type: string;
    external?: boolean;
    rank?: number;
}

export interface EdgeAttributes {
    label?: string;
    type?: string;
}

export interface EdgeJSON extends EdgeAttributes{
    source: string;
    target: string;
}

export interface GraphJSON {
    nodes: NodeAttributesI[];
    edges: EdgeJSON[];
    attributes?: GraphAttributesI;
}

export type Graph = DirectedGraph<NodeAttributesI, EdgeAttributes, GraphAttributesI>;

export interface ClusterI {
    id: string;
    label: string;

    parent_id?: string; // undefined = root cluster

    nodes: string[]; // only direct members
    expanded?: boolean;
}

export interface ClusterBox {
    clusterId: string;
    label: string;
    color: string;
    nodeIds: string[];
    expanded: boolean;
}

export interface ClustersI {
    addCluster(
        label: string,
        parent_id: string,
        nodes: string[],
        expanded: boolean,
    ): ClusterI;
    removeCluster(cluster_id: string): void;

    hasCluster(cluster_id: string): boolean;
    hasNode(node_id: string): boolean;
    moveNode(source: string, target: string): boolean;

    entries(): MapIterator<[string, ClusterI]>;

    // maps graph nodes to the lowest rank parent cluster that is collapsed if any
    // if not the node maps to itself
    getIdToRendedIdMap(graph: Graph): Map<string, string>;

    // nodes
    getAllClusterNodesRecursive(): Set<string>;
    findClusterWithNode(node_id: string): string | null;
    getClusterNodes(cluster_id: string): Set<string>;

    // clusters
    getDirectSubclusters(cluster_id?: string): string[];
    getSubclustersRecursive(cluster_id?: string): string[];
    getParentClusters(cluster_id: string): string[]; // get parents up to root
    getParentCluster(cluster_id: string): string | undefined;

    // expand and collapse
    getExpandedClusters(): Set<string>;
    getCollapsedClusters(): Set<string>;
    expandAllClusters(): Set<string>; // returns the clusters that were changed
    collapseAllClusters(): Set<string>; // returns the clusters that were changed
    expandCluster(cluster_id: string): boolean;
    collapseCluster(cluster_id: string): boolean;

    getClusterRank(cluster: ClusterI): number;
    getCluster(cluster_id: string): ClusterI | undefined;
    getAllClusters(): ClusterI[];

    toJSON(): Record<string, ClusterI>;
}

export interface ViewI {
    label: string;
    filters: FilterI[];
    clusters: ClustersI;
    layout: LayoutI;
}

export interface ViewJSON {
    label: string;
    filters: FilterI[];
    clusters: Record<string, ClusterI>;
    layout: LayoutI;
}

export type ViewsJSON = Record<string, ViewJSON>;

export interface StateJSON {
    graph: GraphJSON;
    views?: ViewsJSON;
}

