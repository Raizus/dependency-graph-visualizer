<script lang="ts">
    import { onMount } from "svelte";
    import type { StateStore } from "../../StateStore";
    import type { GraphRenderer } from "../../visualizer/GraphRenderer";
    import type { MenuItem } from "./ContextMenu";
    import ContextMenu from "./ContextMenu.svelte";
    import {
    background_menu,
        build_node_click_context_menu,
        cluster_box_click_context_menu,
        filter_and_selection_menu,
        type MenuContextI,
    } from "./GraphCanvasContextMenu";

    export let state_store: StateStore;
    export let renderer: GraphRenderer;

    let { filtered_clustered_graph } = state_store;
    let context_menu_items: MenuItem<any>[] = filter_and_selection_menu;
    let menu_context: MenuContextI = {
        state_store,
        node: null,
    };

    // set event callbacks
    onMount(async () => {
        // Handle right-click on node
        renderer.on("nodeRightClick", (event) => {
            console.log("Node right-clicked:", event.nodeId);
            // event.event.preventDefault();
            context_menu_items = filter_and_selection_menu;
            menu_context = {
                state_store,
                node: event.nodeId,
            };

            // // Get node details from graph
            const node_attr = $filtered_clustered_graph?.getNodeAttributes(
                event.nodeId,
            );
            if (!node_attr) return;

            context_menu_items = build_node_click_context_menu(node_attr, []);
        });

        // handle background click
        renderer.on("backgroundClick", (event) => {
            // Clear selection on regular click
            state_store.setSelectedNodes([]);
        });

        // Handle background right-click
        renderer.on("backgroundRightClick", (event) => {
            // Check if it was a right-click
            if ((event.event as any).button !== 2) return;

            event.event.preventDefault();
            context_menu_items = background_menu;

            menu_context = {
                state_store,
                renderer,
            };
        });

        // Handle cluster box right-click
        renderer.on("clusterBoxRightClick", (event) => {
            console.log("Cluster box right-clicked:", event.clusterId);
            event.event.preventDefault();
            context_menu_items = cluster_box_click_context_menu();

            menu_context = {
                state_store,
                renderer,
                cluster_id: event.clusterId,
            };
        });
    });
</script>

<ContextMenu items={context_menu_items} context={menu_context} />
