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
    set_selection_to_intersection_of_reaching_reachables,
    set_selection_to_neighbours_of_node,
    set_selection_to_reachables_of_node,
    set_selection_to_reachables_of_selection,
    set_selection_to_reaching_of_node,
    set_selection_to_reaching_of_selection,
    set_selection_to_sources_of_node,
    set_selection_to_targets_of_node,
    set_selection_to_this_node,
} from "../../Actions";
import type { StateStore } from "../../StateStore";
import type { GraphRenderer } from "../../visualizer/GraphRenderer";
import type { MenuItem } from "./ContextMenu";
import { get } from "svelte/store";

export interface NodeMenuContextI {
    state_store: StateStore;
    node: string | null;
}

export interface BackgroundMenuContextI {
    state_store: StateStore;
    renderer: GraphRenderer;
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
    {
        id: "Remove All But Selected",
        label: "All but selected",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_all_but_selected_action(context.state_store, false);
            console.log("Remove All but selected");
        },
    },
    {
        id: "Remove Separator 1",
        type: "separator",
    },
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
    {
        id: "Remove Separator 2",
        type: "separator",
    },
    {
        id: "Remove Nodes Not Reachables",
        label: "Nodes not reachable",
        type: "action",
        action: () => {
            console.log("Remove nodes not reachable");
        },
    },
    {
        id: "Remove Reachable Targets From Selection",
        label: "Reachable Targets From Selection",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_reachables_of_selection_action(context.state_store, false);
            console.log("Remove reachable targets from selection");
        },
    },
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
    {
        id: "Show Selected",
        label: "Selected",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_selection_action(context.state_store, true);
            console.log("Show selected");
        },
    },
    {
        id: "Show All But Selected",
        label: "All but selected",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_all_but_selected_action(context.state_store, true);
            console.log("Show All but selected");
        },
    },
    {
        id: "Show Separator 1",
        type: "separator",
    },
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
    {
        id: "Show Separator 2",
        type: "separator",
    },
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
    {
        id: "Show Reachables of Selection",
        label: "Reachable of selection",
        type: "action",
        action: (context: NodeMenuContextI) => {
            filter_reachables_of_selection_action(context.state_store, true);
            console.log("Show reachable nodes of selection");
        },
    },
];

const node_select_items: MenuItem<NodeMenuContextI>[] = [
    {
        id: "Select This",
        label: "This",
        type: "action",
        action: (context: NodeMenuContextI) => {
            // set selection action
            console.log("Select this");
            set_selection_to_this_node(context.node, context.state_store);
        },
    },
    {
        id: "Select Separator 1",
        type: "separator",
    },
    {
        id: "Select Sources",
        label: "Sources",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select sources");
            set_selection_to_sources_of_node(context.node, context.state_store);
        },
    },
    {
        id: "Select Targets",
        label: "Targets",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select targets");
            set_selection_to_targets_of_node(context.node, context.state_store);
        },
    },
    // {
    //     id: "Select Siblings",
    //     label: "Siblings",
    //     type: "action",
    //     action: (context: ContextMenuContextI) => {
    //         console.log("Select siblings");
    //         set_selection_to_siblings_of_node(
    //             context.node,
    //             context.state_store,
    //         );
    //     },
    // },
    {
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
    },
    {
        id: "Select Separator 2",
        type: "separator",
    },
    {
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
    },
    {
        id: "Select Reachables Of Selection",
        label: "Reachables of selection",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Sekects reachables of selection");
            set_selection_to_reachables_of_selection(context.state_store);
        },
    },
    {
        id: "Select Separator 3",
        type: "separator",
    },
    {
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
    },
    {
        id: "Select Reaching Sources Of Selection",
        label: "Reaching sources of selection",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select reaching sources of selection");
            set_selection_to_reaching_of_selection(context.state_store);
        },
    },
    {
        id: "Select Reaching Intersection Reachables",
        label: "Reaching Intersection Reachables",
        type: "action",
        action: (context: NodeMenuContextI) => {
            console.log("Select Intersection of reaching and reachables");
            set_selection_to_intersection_of_reaching_reachables(
                context.node,
                context.state_store,
            );
        },
    },
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
    {
        type: "separator",
        id: "Filter And Selection Menu Separator 1",
    },
    {
        id: "Trace Menu",
        label: "Trace",
        type: "group",
        disabled: true,
        children: trace_items,
    },
];

export function build_node_click_context_menu(
    node_attr: NodeAttributesI,
    clusters: string[],
): MenuItem<NodeMenuContextI>[] {
    const items: MenuItem<NodeMenuContextI>[] = [...filter_and_selection_menu];

    if (node_attr.type === "cluster") {
        items.push({
            type: "separator",
            id: "Filter And Selection Menu Separator 2",
        });

        items.push({
            id: "Cluster Menu",
            label: "Cluster",
            type: "group",
            children: build_cluster_node_menu(node_attr, clusters),
        });
    }

    return items;
}

export const background_menu: MenuItem<BackgroundMenuContextI>[] = [
    {
        id: "Show Cycles",
        label: "Show Cycles",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            const graph = get(context.state_store.projected_graph);
            if (!graph) return;
            const nodes = findNodesInCyles(graph);
            context.state_store.setSelectedNodes([...nodes]);
        },
    },
    {
        id: "Background Menu Separator 1",
        type: "separator",
    },
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
    {
        id: "Background Menu Separator 2",
        type: "separator",
    },
    {
        id: "Fold All Clusters",
        label: "Fold all clusters",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            context.state_store.foldAllClusters();
        },
    },
    {
        id: "Unfold All Clusters",
        label: "Unfold all clusters",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            context.state_store.unfoldAllClusters();
        },
    },
    {
        id: "Background Menu Separator 3",
        type: "separator",
    },
    {
        id: "Deselect All",
        label: "Deselect all",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            context.state_store.setSelectedNodes([]);
        },
    },
    {
        id: "Home",
        label: "Home",
        type: "action",
        action: (context: BackgroundMenuContextI) => {
            context.renderer.fitToView();
        },
    },
    {
        id: "Relayout",
        label: "Relayout",
        type: "action",
        action: (context: BackgroundMenuContextI) => {},
    },
];
