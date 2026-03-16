<script lang="ts">
    import { onMount, setContext } from "svelte";
    import GraphCanvas from "./lib/GraphCanvas.svelte";
    import { loadStateJson, StateStore } from "./lib/StateStore";
    import { loadPublicJson } from "./lib/load_graph";
    import Toolbar from "./lib/components/toolbar/Toolbar.svelte";

    const state_store = new StateStore();
    setContext("state_store", state_store);
    let loading = true;

    onMount(async () => {
        try {
            await state_store.initialize();

            const state_json = await loadPublicJson("/examples/example1.json");
            const { graph, views } = loadStateJson(state_json);

            state_store.setState(graph, views);
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
