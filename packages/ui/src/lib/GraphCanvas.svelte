<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import type { StateStore } from "./StateStore";
    import { VisNetworkRenderer } from "./visualizer/VisNetworkRenderer";
    import type { GraphRenderer } from "./visualizer/GraphRenderer";
    import {
        background_menu,
        build_node_click_context_menu,
        type BackgroundMenuContextI,
        type NodeMenuContextI,
    } from "./components/ContextMenu/GraphCanvasContextMenu";
    import ContextMenu from "./components/ContextMenu/ContextMenu.svelte";
    import { filter_and_selection_menu } from "./components/ContextMenu/GraphCanvasContextMenu";
    import type { MenuItem } from "./components/ContextMenu/ContextMenu";

    export let state_store: StateStore;
    let renderer: GraphRenderer;
    let container: HTMLElement;

    let context_menu_items: MenuItem<any>[] = filter_and_selection_menu;
    let selected_node_id: string | null = null;
    let menu_context: NodeMenuContextI | BackgroundMenuContextI = {
        state_store,
        node: null, // Will be updated when menu opens
    };

    let { graph, current_view, selected_nodes, projected_graph } = state_store;

    onMount(async () => {
        if (!container) {
            console.error("Container element not found");
            return;
        }

        renderer = new VisNetworkRenderer();
        renderer.initialize(container);

        renderer.on("selectionChanged", (event) => {
            const nodes = event.nodes;
            state_store.setSelectedNodes(nodes);
        });

        // Set initial graph
        if ($projected_graph) {
            const layout_res = await state_store.layoutEngine.computeLayout($projected_graph, $current_view.clusters);
            console.log("Layout result:", layout_res);
            renderer.setGraphWithLayout($projected_graph, layout_res);
        }

        // Handle right-click on node
        renderer.on("nodeRightClick", (event) => {
            event.event.preventDefault();
            selected_node_id = event.nodeId;
            context_menu_items = filter_and_selection_menu;
            menu_context = {
                state_store,
                node: event.nodeId,
            };

            // // Get node details from graph
            const node_attr = $projected_graph?.getNodeAttributes(event.nodeId);
            if (!node_attr) return;
            context_menu_items = build_node_click_context_menu(node_attr, []);
        });

        // Handle background right-click
        renderer.on("backgroundRightClick", (event) => {
            // Check if it was a right-click
            if ((event.event as any).button === 2) {
                event.event.preventDefault();
                context_menu_items = background_menu;

                menu_context = {
                    state_store,
                    renderer,
                };

            } else {
                // Clear selection on regular click
                //  renderer.selectNodes([]);
            }
        });

        // Prevent default context menu on the container
        container.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    });

    onDestroy(() => {
        if (renderer) {
            renderer.destroy();
        }
        container.removeEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    });

    // Update selection when it changes in store
    $: if (renderer && $selected_nodes) {
        renderer.setSelection($selected_nodes);
    }

    $: if (renderer && $projected_graph) {
        console.log("proj graph update");
        renderer.setGraph($projected_graph);
    }
</script>

<div class="graph-viewer-container">
    <div class="graph-canvas" bind:this={container}></div>

    <ContextMenu items={context_menu_items} context={menu_context} />
</div>

<style>
    .graph-viewer-container {
        width: 100%;
        height: 100%;
        position: relative;
        border: 1px solid lightgray;
    }

    .graph-canvas {
        display: flex;
        width: 100%;
        height: 100%;
    }
</style>
