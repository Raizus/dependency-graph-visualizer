import { findNodesInCyles, type NodeAttributesI } from "@dep-graph-vis/core";
import {
    filter_all_but_selected_action,
    filter_node_action,
    filter_reachables_of_node_action,
    filter_reachables_of_selection_action,
    filter_selection_action,
    filter_siblings_action,
    filter_sources_action,
    filter_targets_action,
} from "../../actions/FilterActions";
import {
    set_selection_to_intersection_of_reaching_reachables,
    set_selection_to_neighbours_of_node,
    set_selection_to_nodes_of_cluster_action,
    set_selection_to_reachables_of_node,
    set_selection_to_reachables_of_selection,
    set_selection_to_reaching_of_node,
    set_selection_to_reaching_of_selection,
    set_selection_to_sources_of_node,
    set_selection_to_targets_of_node,
    set_selection_to_this_node,
} from "../../actions/SelectionActions";
import type { StateStore } from "../../StateStore";
import type { GraphRenderer } from "../../visualizer/GraphRenderer";
import { separator, type MenuAction, type MenuItem } from "./ContextMenu";
import { get } from "svelte/store";

export interface BaseMenuContextI {
    state_store: StateStore;
}

export interface NodeMenuContextI extends BaseMenuContextI {
    node: string | null;
}

export interface BackgroundMenuContextI extends BaseMenuContextI {
    renderer: GraphRenderer;
}

export interface ClusterBoxMenuContextI extends BackgroundMenuContextI {
    cluster_id: string | null;
}

export type MenuContextI =
    | BaseMenuContextI
    | NodeMenuContextI
    | BackgroundMenuContextI
    | ClusterBoxMenuContextI;



namespace FilterSelectionActionItems {
    export const REMOVE_SELECTED: MenuAction<NodeMenuContextI> = {
        id: "Remove Selected",
        label: "Selected",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_selection_action(context.state_store, false);
            console.log("Remove selected");
        },
    };

    export const REMOVE_ALL_BUT_SELECTED: MenuAction<NodeMenuContextI> = {
        id: "Remove All But Selected",
        label: "All but selected",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_all_but_selected_action(context.state_store, false);
            console.log("Remove All but selected");
        },
    };

    export const REMOVE_REACHABLES_OF_SELECTION: MenuAction<NodeMenuContextI> =
        {
            id: "Remove Reachable Targets Of Selection",
            label: "Reachable Targets Of Selection",
            type: "action",
            action: (context: NodeMenuContextI) => {
                filter_reachables_of_selection_action(
                    context.state_store,
                    false,
                );
                console.log("Remove reachables of selection");
            },
        };

    export const SHOW_SELECTED: MenuAction<NodeMenuContextI> = {
        id: "Show Selected",
        label: "Selected",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_selection_action(context.state_store, true);
            console.log("Show selected");
        },
    };

    export const SHOW_ALL_BUT_SELECTED: MenuAction<NodeMenuContextI> = {
        id: "Show All But Selected",
        label: "All but selected",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_all_but_selected_action(context.state_store, true);
            console.log("Show All but selected");
        },
    };

    export const SHOW_REACHABLES_OF_SELECTION: MenuAction<NodeMenuContextI> = {
        id: "Show Reachables of Selection",
        label: "Reachable of selection",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_reachables_of_selection_action(context.state_store, true);
            console.log("Show reachable nodes of selection");
        },
    };
}

namespace SelectionActionItems {
    export const SELECT_THIS: MenuAction<NodeMenuContextI> = {
        id: "Select This",
        label: "This",
        type: "action",
        action: (context: NodeMenuContextI) => {
            // set selection action
            console.log("Select this");
            set_selection_to_this_node(context.node, context.state_store);
        },
    };

    export const SELECT_SOURCES: MenuAction<NodeMenuContextI> = {
        id: "Select Sources",
        label: "Sources",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select sources");
            set_selection_to_sources_of_node(context.node, context.state_store);
        },
    };

    export const SELECT_TARGETS: MenuAction<NodeMenuContextI> = {
        id: "Select Targets",
        label: "Targets",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select targets");
            set_selection_to_targets_of_node(context.node, context.state_store);
        },
    };

    export const SELECT_NEIGHBORS: MenuAction<NodeMenuContextI> = {
        id: "Select Neighbours",
        label: "Neighbours",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select neighbours");
            set_selection_to_neighbours_of_node(
                context.node,
                context.state_store,
            );
        },
    };

    export const SELECT_SIBLINGS: MenuAction<NodeMenuContextI> = {
        id: "Select Siblings",
        label: "Siblings",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select siblings");
            // set_selection_to_siblings_of_node(
            //     context.node,
            //     context.state_store,
            // );
        },
    };

    export const SELECT_REACHABLES: MenuAction<NodeMenuContextI> = {
        id: "Select Reachables",
        label: "Reachables",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select reachables of node");
            set_selection_to_reachables_of_node(
                context.node,
                context.state_store,
            );
        },
    };

    export const SELECT_REACHABLES_OF_SELECTION: MenuAction<NodeMenuContextI> =
        {
            id: "Select Reachables Of Selection",
            label: "Reachables of selection",
            type: "action",
            action: (context: NodeMenuContextI) => {
                console.log("Sekects reachables of selection");
                set_selection_to_reachables_of_selection(context.state_store);
            },
        };

    export const SELECT_REACHING_SOURCES: MenuAction<NodeMenuContextI> = {
        id: "Select Reaching Sources",
        label: "Reaching sources",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select reaching sources of node");
            set_selection_to_reaching_of_node(
                context.node,
                context.state_store,
            );
        },
    };

    export const SELECT_REACHING_SOURCES_OF_SELECTION: MenuAction<NodeMenuContextI> =
        {
            id: "Select Reaching Sources Of Selection",
            label: "Reaching sources of selection",
            type: "action",
            action: (context: NodeMenuContextI) => {
                console.log("Select reaching sources of selection");
                set_selection_to_reaching_of_selection(context.state_store);
            },
        };

    export const SELECT_INTERSECTION_OF_REACHING_AND_REACHABLES: MenuAction<NodeMenuContextI> =
        {
            id: "Select Reaching And Reachables",
            label: "Reaching and Reachables",
            type: "action",
            action: (context: NodeMenuContextI) => {
                console.log("Select Intersection of reaching and reachables");
                set_selection_to_intersection_of_reaching_reachables(
                    context.node,
                    context.state_store,
                );
            },
        };

    export const SELECT_CLUSTER_NODES: MenuAction<ClusterBoxMenuContextI> = {
        id: "Select Cluster Nodes",
        label: "Select cluster nodes",
        type: "action",
        action: (context: ClusterBoxMenuContextI) => {
            console.log("Select cluster nodes");
            set_selection_to_nodes_of_cluster_action(
                context.state_store,
                context.cluster_id,
            );
        },
    };

    export const SELECT_CYCLES: MenuAction<BackgroundMenuContextI> = {
        id: "Show Cycles",
        label: "Show Cycles",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            const graph = get(context.state_store.clustered_graph);
            if (!graph) return;
            const nodes = findNodesInCyles(graph);
            context.state_store.setSelectedNodes([...nodes]);
        },
    };

    export const DESELECT_ALL: MenuAction<BackgroundMenuContextI> = {
        id: "Deselect All",
        label: "Deselect all",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            context.state_store.setSelectedNodes([]);
        },
    };
}

namespace FoldUnfoldClusterActionItems {
    export const FOLD_ALL_CLUSTERS: MenuAction<BackgroundMenuContextI> = {
        id: "Fold All Clusters",
        label: "Fold all clusters",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            context.state_store.foldAllClusters();
        },
    };

    export const UNFOLD_ALL_CLUSTERS: MenuAction<BackgroundMenuContextI> = {
        id: "Unfold All Clusters",
        label: "Unfold all clusters",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            context.state_store.unfoldAllClusters();
        },
    };

    export const FOLD_UNFOLD_CLUSTER: MenuAction<ClusterBoxMenuContextI> = {
        id: "Fold/Unfold This Cluster",
        label: "Fold/Unfold this cluster",
        type: "action",
        action: (context: ClusterBoxMenuContextI) => {
            console.log("Fold/Unfold this");
            const cluster_id = context.cluster_id;
            if (!cluster_id) return;
            context.state_store.foldOrUnfoldCluster(cluster_id);
        },
    };

    export const FOLD_DIRECT_CHILD_CLUSTERS: MenuAction<ClusterBoxMenuContextI> =
        {
            id: "Fold Direct Child Clusters",
            label: "Fold direct child clusters",
            type: "action",
            action: (context: ClusterBoxMenuContextI) => {
                console.log("Fold direct child clusters");
            },
        };

    export const UNFOLD_DIRECT_CHILD_CLUSTERS: MenuAction<ClusterBoxMenuContextI> =
        {
            id: "Unfold Direct Child Clusters",
            label: "Unfold direct child clusters",
            type: "action",
            action: (context: ClusterBoxMenuContextI) => {
                console.log("Unfold direct child clusters");
            },
        };
}

namespace OtherActionItems {
    export const HOME: MenuItem<BackgroundMenuContextI> = {
        id: "Home",
        label: "Home",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            context.renderer.fitToView();
        },
    };

    export const RELAYOUT: MenuItem<BackgroundMenuContextI> = {
        id: "Relayout",
        label: "Relayout",
        type: "action",
        action: (context: BackgroundMenuContextI) => {},
    };
}

const node_remove_items: MenuItem<NodeMenuContextI>[] = [
    {
        id: "Remove This",
        label: "This",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Remove this");
            filter_node_action(context.state_store, context.node, false);
        },
    },
    {
        id: "Remove Selected",
        label: "Selected",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_selection_action(context.state_store, false);
            console.log("Remove selected");
        },
    },
    FilterSelectionActionItems.REMOVE_SELECTED,
    FilterSelectionActionItems.REMOVE_ALL_BUT_SELECTED,
    separator("Remove Separator 1"),
    {
        id: "Remove Sources",
        label: "Sources",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_sources_action(context.state_store, context.node, false);
            console.log("Remove sources");
        },
    },
    {
        id: "Remove Targets",
        label: "Targets",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_targets_action(context.state_store, context.node, false);
            console.log("Remove targets");
        },
    },
    {
        id: "Remove Siblings",
        label: "Siblings",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_siblings_action(context.state_store, context.node, false);
            console.log("Remove siblings");
        },
    },
    separator("Remove Separator 2"),
    {
        id: "Remove Nodes Not Reachables",
        label: "Nodes not reachable",
        type: "action",
        action: () => {
            console.log("Remove nodes not reachable");
        },
    },
    FilterSelectionActionItems.REMOVE_REACHABLES_OF_SELECTION,
];

const node_show_items: MenuItem<NodeMenuContextI>[] = [
    {
        id: "Show This",
        label: "This",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_node_action(context.state_store, context.node, true);
            console.log("Show this");
        },
    },
    FilterSelectionActionItems.SHOW_SELECTED,
    FilterSelectionActionItems.SHOW_ALL_BUT_SELECTED,
    separator("Show Separator 1"),
    {
        id: "Show Sources",
        label: "Sources",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_sources_action(context.state_store, context.node, true);
            console.log("Show sources");
        },
    },
    {
        id: "Show Targets",
        label: "Targets",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_targets_action(context.state_store, context.node, true);
            console.log("Show targets");
        },
    },
    {
        id: "Show Siblings",
        label: "Siblings",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_siblings_action(context.state_store, context.node, true);
            console.log("Show siblings");
        },
    },
    separator("Show Separator 2"),
    {
        id: "Show Reachables",
        label: "Reachables",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_reachables_of_node_action(
                context.state_store,
                context.node,
                true,
            );
            console.log("Show reachable nodes");
        },
    },
    FilterSelectionActionItems.SHOW_REACHABLES_OF_SELECTION,
];

const node_select_items: MenuItem<NodeMenuContextI>[] = [
    SelectionActionItems.SELECT_THIS,
    separator("Select Separator 1"),
    SelectionActionItems.SELECT_SOURCES,
    SelectionActionItems.SELECT_TARGETS,
    SelectionActionItems.SELECT_NEIGHBORS,
    separator("Select Separator 2"),
    SelectionActionItems.SELECT_REACHABLES,
    SelectionActionItems.SELECT_REACHABLES_OF_SELECTION,
    separator("Select Separator 3"),
    SelectionActionItems.SELECT_REACHING_SOURCES,
    SelectionActionItems.SELECT_REACHING_SOURCES_OF_SELECTION,
    SelectionActionItems.SELECT_INTERSECTION_OF_REACHING_AND_REACHABLES,
];

const trace_items: MenuItem<NodeMenuContextI>[] = [];

function build_cluster_items(clusters: string[]) {
    const items: MenuItem<NodeMenuContextI>[] = [];

    for (const cluster of clusters) {
        items.push({
            id: `${cluster}`,
            label: cluster,
            type: "action",
            action: (context: NodeMenuContextI) => {
                console.log(`${cluster}`);
                // add/move node to cluster action
            },
        });
    }

    return items;
}

function build_cluster_modification_menu(clusters: string[]) {
    const items: MenuItem<NodeMenuContextI>[] = [
        {
            id: "Add This To Cluster Menu",
            label: "This",
            type: "group",
            children: build_cluster_items(clusters),
        },
        {
            id: "Add This And Selected To Cluster Menu",
            label: "This and selected",
            type: "group",
            children: build_cluster_items(clusters),
        },
    ];
    return items;
}

function build_cluster_node_menu(
    node_attr: NodeAttributesI,
    clusters: string[],
): MenuItem<NodeMenuContextI>[] {
    const items: MenuItem<NodeMenuContextI>[] = [];

    // clicked node is a cluster node
    if (node_attr.type === "cluster") {
        items.push({
            id: "Fold/Unfold This",
            label: "Fold/Unfold this",
            type: "action",
            action: (context: NodeMenuContextI) => {
                console.log("Fold/Unfold this");
                const node_id = context.node;
                if (!node_id) return;
                context.state_store.foldOrUnfoldCluster(node_id);
            },
        });
    }
    // clicked node is a base node, can be added or removed from a cluster
    else {
        items.push({
            id: "Add To Cluster",
            label: "Add",
            type: "group",
            disabled: true,
            children: build_cluster_modification_menu(clusters),
        });
    }

    return items;
}

const cluster_items: MenuItem<NodeMenuContextI>[] = [
    {
        id: "Fold/Unfold This",
        label: "Fold/Unfold this",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Fold/Unfold this");
        },
    },
    {
        id: "Add To Cluster",
        label: "Add",
        type: "group",
        disabled: true,
        children: [],
    },
    {
        id: "Remove From Cluster",
        label: "Remove",
        type: "group",
        disabled: true,
        children: [],
    },
];

export const filter_and_selection_menu: MenuItem<NodeMenuContextI>[] = [
    {
        id: "Remove Menu",
        label: "Remove",
        type: "group",
        children: node_remove_items,
    },
    {
        id: "Show Menu",
        label: "Show (add)",
        type: "group",
        children: node_show_items,
    },
    {
        id: "Select Menu",
        label: "Select",
        type: "group",
        children: node_select_items,
    },
    separator("Filter And Selection Menu Separator 1"),
    {
        id: "Trace Menu",
        label: "Trace",
        type: "group",
        disabled: true,
        children: trace_items,
    },
];

export const background_menu: MenuItem<BackgroundMenuContextI>[] = [
    SelectionActionItems.SELECT_CYCLES,
    separator("Background Menu Separator 1"),
    {
        id: "Remove Nodes Without Edges",
        label: "Remove nodes without edges",
        type: "action",
        action: (context: BackgroundMenuContextI) => {},
    },
    {
        id: "Remove Nodes Reachable From Multiple Clusters",
        label: "Remove nodes reachable from multiple clusters",
        type: "action",
        action: (context: BackgroundMenuContextI) => {},
    },
    separator("Background Menu Separator 2"),
    FoldUnfoldClusterActionItems.FOLD_ALL_CLUSTERS,
    FoldUnfoldClusterActionItems.UNFOLD_ALL_CLUSTERS,
    separator("Background Menu Separator 3"),
    SelectionActionItems.DESELECT_ALL,
    OtherActionItems.HOME,
    OtherActionItems.RELAYOUT,
];

export function build_node_click_context_menu(
    node_attr: NodeAttributesI,
    clusters: string[],
): MenuItem<NodeMenuContextI>[] {
    const items: MenuItem<NodeMenuContextI>[] = [...filter_and_selection_menu];

    if (node_attr.type === "cluster") {
        items.push(separator("Filter And Selection Menu Separator 2"));

        items.push({
            id: "Cluster Menu",
            label: "Cluster",
            type: "group",
            children: build_cluster_node_menu(node_attr, clusters),
        });
    }

    return items;
}

export function cluster_box_click_context_menu(): MenuItem<ClusterBoxMenuContextI>[] {
    const items: MenuItem<ClusterBoxMenuContextI>[] = [
        {
            id: "Cluster Menu",
            label: "Cluster",
            type: "group",
            children: [
                FoldUnfoldClusterActionItems.FOLD_UNFOLD_CLUSTER,
                FoldUnfoldClusterActionItems.FOLD_DIRECT_CHILD_CLUSTERS,
                separator("Cluster Separator 1"),
                FoldUnfoldClusterActionItems.UNFOLD_DIRECT_CHILD_CLUSTERS,
                FoldUnfoldClusterActionItems.FOLD_ALL_CLUSTERS,
                separator("Cluster Separator 2"),
                FoldUnfoldClusterActionItems.UNFOLD_ALL_CLUSTERS,
            ],
        },
        separator("Cluster Box Separator 1"),
        {
            id: "Selection Menu",
            label: "Seletionc",
            type: "group",
            children: [SelectionActionItems.SELECT_CLUSTER_NODES],
        },
        separator("Cluster Box Separator 2"),
        OtherActionItems.HOME,
        OtherActionItems.RELAYOUT,
    ];

    return items;
}
