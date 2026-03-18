import {
    findNodesInCyles,
    topNodesByInDegree,
    topNodesByOutDegree,
    type NodeAttributesI,
} from "@dep-graph-vis/core";
import {
    filter_all_but_selected_action,
    filter_node_action,
    filter_reachables_of_node_action,
    filter_reachables_of_selection_action,
    filter_reaching_of_selection_action,
    filter_selection_action,
    filter_siblings_action,
    filter_sources_action,
    filter_targets_action,
} from "../../actions/FilterActions";
import {
    invert_selection_action,
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

namespace NodeFilterActionItems {
    export const REMOVE_NODE: MenuAction<NodeMenuContextI> = {
        id: "Remove This",
        label: "This",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_node_action(context.state_store, context.node, false);
        },
    };

    export const REMOVE_SOURCES: MenuAction<NodeMenuContextI> = {
        id: "Remove Sources",
        label: "Sources",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_sources_action(context.state_store, context.node, false);
        },
    };

    export const REMOVE_TARGETS: MenuAction<NodeMenuContextI> = {
        id: "Remove Targets",
        label: "Targets",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_targets_action(context.state_store, context.node, false);
        },
    };

    export const REMOVE_SIBLINGS: MenuAction<NodeMenuContextI> = {
        id: "Remove Siblings",
        label: "Siblings",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_siblings_action(context.state_store, context.node, false);
        },
    };

    export const REMOVE_NOT_REACHABLES: MenuAction<NodeMenuContextI> = {
        id: "Remove Nodes Not Reachables",
        label: "Nodes not reachable",
        type: "action",
        action: () => {
            console.log("Remove nodes not reachable");
        },
    };

    export const REMOVE_NODES_NOT_REACHABLE_FROM_OUTSIDE: MenuAction<ClusterBoxMenuContextI> =
        {
            id: "Remove Nodes Not Reachable From Outside",
            label: "Nodes not reachable from outside",
            type: "action",
            action: () => {
                console.log("Remove nodes not reachable from outside");
            },
        };

    export const REMOVE_NODES_NOT_REACHING_OUTSIDE: MenuAction<ClusterBoxMenuContextI> =
        {
            id: "Remove Nodes Not Reaching Outside",
            label: "Nodes not reaching outside",
            type: "action",
            action: () => {
                console.log("Remove nodes not reaching outside");
            },
        };

    export const REMOVE_NODES_NOT_CONNECTED_WITH_OUTSIDE: MenuAction<ClusterBoxMenuContextI> =
        {
            id: "Remove Nodes Not Connected With Outside",
            label: "Nodes not connected with outside",
            type: "action",
            action: () => {
                console.log("Remove nodes not connected with outside");
            },
        };

    export const SHOW_NODE: MenuAction<NodeMenuContextI> = {
        id: "Show This Node",
        label: "This",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_node_action(context.state_store, context.node, true);
        },
    };

    export const SHOW_SOURCES: MenuAction<NodeMenuContextI> = {
        id: "Show Sources Of Node",
        label: "Sources",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_sources_action(context.state_store, context.node, true);
        },
    };

    export const SHOW_TARGETS: MenuAction<NodeMenuContextI> = {
        id: "Show Targets Of Node",
        label: "Targets",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_targets_action(context.state_store, context.node, true);
        },
    };

    export const SHOW_SIBLINGS: MenuAction<NodeMenuContextI> = {
        id: "Show Siblings Of Node",
        label: "Siblings",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_siblings_action(context.state_store, context.node, true);
        },
    };

    export const SHOW_REACHABLES: MenuAction<NodeMenuContextI> = {
        id: "Show Reachable Targets of Node",
        label: "Reachable Targets",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_reachables_of_node_action(
                context.state_store,
                context.node,
                true,
            );
        },
    };
}

namespace FilterSelectionActionItems {
    export const REMOVE_SELECTED: MenuAction<BaseMenuContextI> = {
        id: "Remove Selected",
        label: "Selected",
        type: "action",
        action: (context: BaseMenuContextI) => {
            filter_selection_action(context.state_store, false);
        },
    };

    export const REMOVE_ALL_BUT_SELECTED: MenuAction<BaseMenuContextI> = {
        id: "Remove All But Selected",
        label: "All but selected",
        type: "action",
        action: (context: BaseMenuContextI) => {
            filter_all_but_selected_action(context.state_store, false);
        },
    };

    export const REMOVE_REACHABLES_OF_SELECTION: MenuAction<BaseMenuContextI> =
        {
            id: "Remove Reachable Targets Of Selection",
            label: "Reachable Targets Of Selection",
            type: "action",
            action: (context: BaseMenuContextI) => {
                filter_reachables_of_selection_action(
                    context.state_store,
                    false,
                );
            },
        };

    export const REMOVE_REACHING_OF_SELECTION: MenuAction<BaseMenuContextI> = {
        id: "Remove Reaching Sources Of Selection",
        label: "Reaching sources of selection",
        type: "action",
        action: (context: BaseMenuContextI) => {
            filter_reaching_of_selection_action(context.state_store, false);
        },
    };

    export const SHOW_SELECTED: MenuAction<BaseMenuContextI> = {
        id: "Show Selected",
        label: "Selected",
        type: "action",
        action: (context: BaseMenuContextI) => {
            filter_selection_action(context.state_store, true);
        },
    };

    export const SHOW_ALL_BUT_SELECTED: MenuAction<BaseMenuContextI> = {
        id: "Show All But Selected",
        label: "All but selected",
        type: "action",
        action: (context: BaseMenuContextI) => {
            filter_all_but_selected_action(context.state_store, true);
        },
    };

    export const SHOW_REACHABLES_OF_SELECTION: MenuAction<BaseMenuContextI> = {
        id: "Show Reachable Targets of Selection",
        label: "Reachable targets of selection",
        type: "action",
        action: (context: BaseMenuContextI) => {
            filter_reachables_of_selection_action(context.state_store, true);
        },
    };

    export const SHOW_REACHING_OF_SELECTION: MenuAction<BaseMenuContextI> = {
        id: "Show Reaching Sources Of Selection",
        label: "Reaching sources of selection",
        type: "action",
        action: (context: BaseMenuContextI) => {
            filter_reaching_of_selection_action(context.state_store, true);
        },
    };
}

namespace SelectionActionItems {
    export const SELECT_THIS: MenuAction<NodeMenuContextI> = {
        id: "Select This Node",
        label: "This",
        type: "action",
        action: (context: NodeMenuContextI) => {
            set_selection_to_this_node(context.node, context.state_store);
        },
    };

    export const SELECT_SOURCES: MenuAction<NodeMenuContextI> = {
        id: "Select Sources Of Node",
        label: "Sources",
        type: "action",
        action: (context: NodeMenuContextI) => {
            set_selection_to_sources_of_node(context.node, context.state_store);
        },
    };

    export const SELECT_TARGETS: MenuAction<NodeMenuContextI> = {
        id: "Select Targets Of Node",
        label: "Targets",
        type: "action",
        action: (context: NodeMenuContextI) => {
            set_selection_to_targets_of_node(context.node, context.state_store);
        },
    };

    export const SELECT_NEIGHBORS: MenuAction<NodeMenuContextI> = {
        id: "Select Neighbours Of Node",
        label: "Neighbours",
        type: "action",
        action: (context: NodeMenuContextI) => {
            set_selection_to_neighbours_of_node(
                context.node,
                context.state_store,
            );
        },
    };

    export const SELECT_SIBLINGS: MenuAction<NodeMenuContextI> = {
        id: "Select Siblings Of Node",
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
        id: "Select Reachable Targets Of Node",
        label: "Reachables",
        type: "action",
        action: (context: NodeMenuContextI) => {
            set_selection_to_reachables_of_node(
                context.node,
                context.state_store,
            );
        },
    };

    export const SELECT_REACHABLES_OF_SELECTION: MenuAction<BaseMenuContextI> = {
        id: "Select Reachable Targets Of Selection",
        label: "Reachable targets of selection",
        type: "action",
        action: (context: BaseMenuContextI) => {
            set_selection_to_reachables_of_selection(context.state_store);
        },
    };

    export const SELECT_REACHING_SOURCES: MenuAction<NodeMenuContextI> = {
        id: "Select Reaching Sources Of Node",
        label: "Reaching sources",
        type: "action",
        action: (context: NodeMenuContextI) => {
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
                set_selection_to_reaching_of_selection(context.state_store);
            },
        };

    export const SELECT_INTERSECTION_OF_REACHING_AND_REACHABLES: MenuAction<NodeMenuContextI> =
        {
            id: "Select Intersection Of Reaching And Reachables",
            label: "Intersection Of reaching and reachables",
            type: "action",
            action: (context: NodeMenuContextI) => {
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
            set_selection_to_nodes_of_cluster_action(
                context.state_store,
                context.cluster_id,
            );
        },
    };

    export const SELECT_CYCLES: MenuAction<BackgroundMenuContextI> = {
        id: "Select Cycles",
        label: "Select Cycles",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            const graph = get(context.state_store.clustered_graph);
            if (!graph) return;
            const nodes = findNodesInCyles(graph);
            context.state_store.setSelectedNodes([...nodes]);
        },
    };

    export const CLEAR_SELECTION: MenuAction<BaseMenuContextI> = {
        id: "Clear Selection",
        label: "Clear selection",
        type: "action",
        action: (context: BaseMenuContextI) => {
            context.state_store.setSelectedNodes([]);
        },
    };

    export const INVERT_SELECTION: MenuAction<BaseMenuContextI> = {
        id: "Invert Selection",
        label: "Invert selection",
        type: "action",
        action: (context: BaseMenuContextI) => {
            invert_selection_action(context.state_store);
        },
    };

    export const SELECT_TOP_5_MOST_INCOMING: MenuAction<BackgroundMenuContextI> =
        {
            id: "Select Top 5 Most Incoming",
            label: "Select top 5 most incoming",
            type: "action",
            action: (context: BackgroundMenuContextI) => {
                const graph = get(context.state_store.clustered_graph);
                if (!graph) return;
                const nodes = topNodesByInDegree(graph, 5);
                context.state_store.setSelectedNodes([...nodes]);
            },
        };

    export const SELECT_TOP_5_MOST_OUTGOING: MenuAction<BackgroundMenuContextI> =
        {
            id: "Select Top 5 Most Outgoing",
            label: "Select top 5 most outgoing",
            type: "action",
            action: (context: BackgroundMenuContextI) => {
                const graph = get(context.state_store.clustered_graph);
                if (!graph) return;
                const nodes = topNodesByOutDegree(graph, 5);
                context.state_store.setSelectedNodes([...nodes]);
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
                const cluster_id = context.cluster_id;
                if (!cluster_id) return;
                context.state_store.foldDirectChildClusters(cluster_id);
            },
        };

    export const UNFOLD_DIRECT_CHILD_CLUSTERS: MenuAction<ClusterBoxMenuContextI> =
        {
            id: "Unfold Direct Child Clusters",
            label: "Unfold direct child clusters",
            type: "action",
            action: (context: ClusterBoxMenuContextI) => {
                const cluster_id = context.cluster_id;
                if (!cluster_id) return;
                context.state_store.unfoldDirectChildClusters(cluster_id);
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

    export const ZOOM_TO_SELECTION: MenuItem<BaseMenuContextI> = {
        id: "Zoom To Selection",
        label: "Zoom to selection",
        type: "action",
        action: (context: BaseMenuContextI) => {
            const selection = get(context.state_store.selected_nodes);
            if (selection.length === 0) return;
            const renderer = get(context.state_store.renderer);
            renderer?.fitToNodes(selection);
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
    NodeFilterActionItems.REMOVE_NODE,
    FilterSelectionActionItems.REMOVE_SELECTED,
    FilterSelectionActionItems.REMOVE_ALL_BUT_SELECTED,
    separator("Remove Separator 1"),
    NodeFilterActionItems.REMOVE_SOURCES,
    NodeFilterActionItems.REMOVE_TARGETS,
    NodeFilterActionItems.REMOVE_SIBLINGS,
    separator("Remove Separator 2"),
    NodeFilterActionItems.REMOVE_NOT_REACHABLES,
    FilterSelectionActionItems.REMOVE_REACHABLES_OF_SELECTION,
];

const node_show_items: MenuItem<NodeMenuContextI>[] = [
    NodeFilterActionItems.SHOW_NODE,
    FilterSelectionActionItems.SHOW_SELECTED,
    FilterSelectionActionItems.SHOW_ALL_BUT_SELECTED,
    separator("Show Separator 1"),
    NodeFilterActionItems.SHOW_SOURCES,
    NodeFilterActionItems.SHOW_TARGETS,
    NodeFilterActionItems.SHOW_SIBLINGS,
    separator("Show Separator 2"),
    NodeFilterActionItems.SHOW_REACHABLES,
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
    {
        id: "Remove Menu",
        label: "Remove",
        type: "group",
        children: [
            FilterSelectionActionItems.REMOVE_SELECTED,
            FilterSelectionActionItems.REMOVE_ALL_BUT_SELECTED,
            FilterSelectionActionItems.REMOVE_REACHABLES_OF_SELECTION,
        ],
    },
    {
        id: "Show Menu",
        label: "Show (add)",
        type: "group",
        children: [
            FilterSelectionActionItems.SHOW_SELECTED,
            FilterSelectionActionItems.SHOW_ALL_BUT_SELECTED,
            FilterSelectionActionItems.SHOW_REACHABLES_OF_SELECTION,
        ],
    },
    {
        id: "Selection Menu",
        label: "Selection",
        type: "group",
        children: [
            SelectionActionItems.SELECT_CYCLES,
            separator("Selection Separator 1"),
            SelectionActionItems.INVERT_SELECTION,
            SelectionActionItems.CLEAR_SELECTION,
        ],
    },
    separator("Background Menu Separator 1"),
    // {
    //     id: "Remove Nodes Without Edges",
    //     label: "Remove nodes without edges",
    //     type: "action",
    //     action: (context: BackgroundMenuContextI) => {},
    // },
    // {
    //     id: "Remove Nodes Reachable From Multiple Clusters",
    //     label: "Remove nodes reachable from multiple clusters",
    //     type: "action",
    //     action: (context: BackgroundMenuContextI) => {},
    // },
    {
        id: "Cluster Menu",
        label: "Clusters",
        type: "group",
        children: [
            FoldUnfoldClusterActionItems.FOLD_ALL_CLUSTERS,
            FoldUnfoldClusterActionItems.UNFOLD_ALL_CLUSTERS,
        ],
    },
    separator("Background Menu Separator 3"),
    OtherActionItems.HOME,
    OtherActionItems.ZOOM_TO_SELECTION,
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
            label: "Clusters",
            type: "group",
            children: [
                FoldUnfoldClusterActionItems.FOLD_UNFOLD_CLUSTER,
                separator("Cluster Separator 1"),
                FoldUnfoldClusterActionItems.FOLD_DIRECT_CHILD_CLUSTERS,
                FoldUnfoldClusterActionItems.UNFOLD_DIRECT_CHILD_CLUSTERS,
                separator("Cluster Separator 2"),
                FoldUnfoldClusterActionItems.FOLD_ALL_CLUSTERS,
                FoldUnfoldClusterActionItems.UNFOLD_ALL_CLUSTERS,
            ],
        },
        separator("Cluster Box Separator 1"),
        {
            id: "Selection Menu",
            label: "Selection",
            type: "group",
            children: [
                SelectionActionItems.SELECT_CLUSTER_NODES,
                separator("Selection Separator 1"),
                SelectionActionItems.SELECT_CYCLES,
                SelectionActionItems.SELECT_TOP_5_MOST_INCOMING,
                SelectionActionItems.SELECT_TOP_5_MOST_OUTGOING,
                separator("Selection Separator 2"),
                SelectionActionItems.INVERT_SELECTION,
                SelectionActionItems.CLEAR_SELECTION,
            ],
        },
        separator("Cluster Box Separator 2"),
        OtherActionItems.HOME,
        OtherActionItems.ZOOM_TO_SELECTION,
        OtherActionItems.RELAYOUT,
    ];

    return items;
}
