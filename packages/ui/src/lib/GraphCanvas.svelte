<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { StateStore } from "./StateStore";
    import type { GraphRenderer } from "./visualizer/GraphRenderer";
    import {
        layoutToDotOptions,
        type Graph,
        type ViewI,
    } from "@dep-graph-vis/core";
    import { D3GraphRenderer } from "./visualizer/D3GraphRenderer";
    import ContextMenuBuilder from "./components/ContextMenu/ContextMenuBuilder.svelte";

    export let state_store: StateStore;
    let renderer: GraphRenderer = new D3GraphRenderer();
    let container: HTMLElement;

    let { current_view, selected_nodes, filtered_clustered_graph } = state_store;

    async function updateLayout(graph: Graph, view: ViewI) {
        const dot_options = layoutToDotOptions(view.layout);
        const dot = state_store.layoutEngine.buildDot(
            graph,
            view.clusters,
            dot_options,
        );
        const svg_str = await state_store.layoutEngine.computeSvg(dot);
        renderer.setSvgLayout(graph, view.clusters, svg_str);
    }

    onMount(async () => {
        if (!container) {
            console.error("Container element not found");
            return;
        }

        renderer.initialize(container);
        state_store.setRenderer(renderer);

        // Set initial graph
        if ($filtered_clustered_graph) {
            updateLayout($filtered_clustered_graph, $current_view);
        }

        // Set up renderer events
        // Listen for selection changes from the renderer
        renderer.on("selectionChanged", (event) => {
            const nodes = event.nodes;
            state_store.setSelectedNodes(nodes);
        });

        // handle background click
        renderer.on("backgroundClick", (event) => {
            // Clear selection on regular click
            state_store.setSelectedNodes([]);
        });

        // Prevent default context menu on the container
        container.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    });

    onDestroy(() => {
        if (renderer) {
            renderer.destroy();
            state_store.setRenderer(null); 
        }
        
        container.removeEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    });

    // Update selection when it changes in store
    $: if (renderer && $selected_nodes) {
        renderer.setSelection($selected_nodes);
    }

    $: if (renderer && $filtered_clustered_graph) {
        updateLayout($filtered_clustered_graph, $current_view);
    }
</script>

<div class="graph-viewer-container">
    <div class="graph-canvas" bind:this={container}></div>

    <ContextMenuBuilder {state_store} {renderer} />
</div>

<style>
    .graph-viewer-container {
        width: 100%;
        height: 100%;
        position: relative;
        border: none;
    }

    .graph-canvas {
        display: flex;
        width: 100%;
        height: 100%;
    }
</style>
