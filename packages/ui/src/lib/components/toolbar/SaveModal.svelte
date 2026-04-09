<script lang="ts">
    import { getContext } from "svelte";
    import { download } from "./utils";
    import type { StateStore } from "../../StateStore";
    import { get } from "svelte/store";
    import { layoutToExportDotOptions } from "@dep-graph-vis/core";

    const state_store = getContext<StateStore>("state_store")

    const downloadJson = (file_base_name = "graph_vis") => {
        // const graph = get(state_store.graph);
        const out = state_store.toJSON();
        const json_str = JSON.stringify(out, null, 2);
        download(json_str, `${file_base_name}.json`, "text/plain");
    };

    function getDot() {
        const graph = get(state_store.filtered_clustered_graph);
        if (!graph) return;
        const view = get(state_store.current_view);
        const clusters = view.clusters;
        const dot_options = layoutToExportDotOptions(view.layout);
        const dot = state_store.layoutEngine.buildDot(graph, clusters, dot_options);
        return dot;        
    }

    const downloadDot = (file_base_name = "graph_vis") => {
        const dot = getDot();
        if (!dot) return;
        download(dot, `${file_base_name}.dot`, "text/plain");
    };

    const downloadSvg = async (file_base_name = "graph_vis") => {
        const dot = getDot();
        if (!dot) return;
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
