<script lang="ts">
    import { onMount, setContext } from "svelte";
    import GraphCanvas from "./lib/GraphCanvas.svelte";
    import { StateStore } from "./lib/StateStore";
    import { loadPublicJson } from "./lib/load_graph";
    import {
    assignNodeRanks,
        buildHierarquicalClusters,
        ClusterManager,
        loadDirectedGraphFromJSON,
        newView,
        ViewMap,
    } from "@dep-graph-vis/core";
    import Toolbar from "./lib/components/toolbar/Toolbar.svelte";

    const state_store = new StateStore();
    setContext("state_store", state_store);
    let loading = true;

    onMount(async () => {
        try {
            // Load default example
            await state_store.initialize()
            const graph_json = await loadPublicJson("/examples/graph.json");
            const graph = loadDirectedGraphFromJSON(graph_json);
            assignNodeRanks(graph);

            const cluster_map = buildHierarquicalClusters(graph);
            const label = "Hierarquical View";
            const view = newView(label);
            const view_map = new ViewMap();
            view_map.set(label, view);
            view.clusters = new ClusterManager([...cluster_map.values()]);
            state_store.setState(graph, view_map);

        } catch (error) {
            console.error("Failed to load example:", error);
        } finally {
            loading = false;
        }
    });
</script>

<main>
    {#if loading}
        <div class="loading">Loading graph...</div>
    {:else}
        <GraphCanvas state_store={state_store} />
        <Toolbar />
    {/if}
</main>

<style>
    main {
        width: 100%;
        height: 100%;
    }
</style>
