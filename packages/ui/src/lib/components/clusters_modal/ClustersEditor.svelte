<script lang="ts">
    import { getContext } from "svelte";
    import type { StateStore } from "../../StateStore";
    import LeftPane from "./LeftPane.svelte";
    import RightPane from "./RightPane.svelte";

    const state_store = getContext<StateStore>("state_store");

    const graph_store = state_store.graph;
    const view_store = state_store.current_view;
    const filtered_clustered_graph_store = state_store.filtered_clustered_graph;

    $: graph = $graph_store;
    $: clusters = $view_store.clusters;
    $: clustered_graph = $filtered_clustered_graph_store;
</script>

<div class="clusters-editor">
    <LeftPane {graph} {clusters} />
    <div class="divider"></div>
    <RightPane base_graph={graph} {clustered_graph} {clusters}/>
</div>

<style lang="scss">
    .clusters-editor {
        --bg: #0f1117;
        --surface: #161b27;
        --surface-hover: #1e2535;
        --border: #252d3d;
        --text: #c8d3e8;
        --text-muted: #5a6a8a;
        --text-dim: #3a4a6a;
        --radius: 6px;
        // --font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
        --font-ui: "IBM Plex Sans", "Segoe UI", sans-serif;

        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        color: var(--text);
        // font-family: var(--font-mono);
        overflow: hidden;
        border: 1px solid none;
    }

    .divider {
        width: 5px;
        background: "none";
        flex-shrink: 0;
    }

    .clusters-editor :global(.pane) {
        flex: 1 1 0;
        min-width: 0;
        min-height: 400px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--bg);
        border-radius: var(--radius);
    }

    .clusters-editor :global(.pane-header) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px 10px;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
        flex-shrink: 0;
    }

    .clusters-editor :global(.pane-title) {
        font-family: var(--font-ui);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--text-muted);
    }

    /* ── Filter row ── */
    .clusters-editor :global(.filter-row) {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 10px;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
    }

    .clusters-editor :global(.filter-icon) {
        color: var(--text-dim);
        font-size: 25px;
        line-height: 1;
        flex-shrink: 0;
    }

    .clusters-editor :global(.filter-input) {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-family: var(--font-mono);
        font-size: 12px;
        color: var(--text);
        caret-color: #3b7cf4;
        min-width: 0;

        &::placeholder {
            color: var(--text-dim);
        }
    }

    .clusters-editor :global(.clear-btn) {
        background: none;
        border: none;
        color: var(--text-dim);
        cursor: pointer;
        font-size: 10px;
        padding: 2px 4px;
        line-height: 1;
        border-radius: 3px;
        transition: color 0.15s;
        flex-shrink: 0;

        &:hover {
            color: var(--text);
        }
    }

    /* ── Scrollable list box ── */
    .clusters-editor :global(.list-box) {
        flex: 1 1 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 4px 0;
        scrollbar-width: thin;
        scrollbar-color: var(--border) transparent;

        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-track {
            background: transparent;
        }
        &::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 2px;
        }
    }
</style>
