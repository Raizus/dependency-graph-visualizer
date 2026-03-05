<script lang="ts">
    import { getContext } from "svelte";
    import { download } from "./utils";
    import type { StateStore } from "../../StateStore";
    import { get } from "svelte/store";

    const state_store = getContext<StateStore>("state_store")

    const downloadJson = (file_base_name = "graph_vis") => {
        const json_str = "{}";
        download(json_str, `${file_base_name}.json`, "text/plain");
    };

    const downloadDot = (file_base_name = "graph_vis") => {
        const proj_graph = get(state_store.projected_graph);
        if (!proj_graph) return;
        const clusters = get(state_store.current_view).clusters;
        const dot = state_store.layoutEngine.buildDot(proj_graph, clusters);
        download(dot, `${file_base_name}.dot`, "text/plain");
    };

    const downloadSvg = async (file_base_name = "graph_vis") => {
        const proj_graph = get(state_store.projected_graph);
        if (!proj_graph) return;
        const clusters = get(state_store.current_view).clusters;
        const dot = state_store.layoutEngine.buildDot(proj_graph, clusters);
        const svg = await state_store.layoutEngine.computeSvg(dot);
        download(svg, `${file_base_name}.svg`, "text/plain");
    };
</script>

<div class="container">
    <button on:click={() => downloadJson()}> Json </button>
    <button on:click={() => downloadDot()}> Dot </button>
    <button on:click={() => downloadSvg()}> SVG </button>
</div>

<style>
    .container{
        display: flex;
        align-items: center;
        justify-content: space-around;
    }
</style>
