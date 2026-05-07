<script lang="ts">
    import { onMount, setContext } from "svelte";
    import GraphCanvas from "@dep-graph-vis/ui/GraphCanvas.svelte";
    import { StateStore, loadStateJson } from "@dep-graph-vis/ui/StateStore.ts";
    import Toolbar from "@dep-graph-vis/ui/Toolbar.svelte";

    export let graphData: any;

    const state_store = new StateStore();
    setContext("state_store", state_store);
    let loading = true;

    onMount(async () => {
        if (!graphData) {
            loading = false;
            return;
        }
        try {
            await state_store.initialize();
            const { graph, views } = loadStateJson(graphData);
            state_store.setState(graph, views);
        } catch (error) {
            console.error("Failed to load graph:", error);
        } finally {
            loading = false;
        }
    });
</script>

<main>
    {#if loading}
        <div class="loading">Loading graph...</div>
    {:else}
        <GraphCanvas {state_store} />
        <Toolbar />
    {/if}
</main>

<style>
    main {
        width: 100%;
        height: 100%;
    }
</style>
