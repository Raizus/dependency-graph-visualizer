<script lang="ts">
    import { type ClustersI, type Graph, nodeMatch } from "@dep-graph-vis/core";

    export let graph: Graph | null;
    export let clusters: ClustersI;

    let query: string = "";

    function getUnclusteredNodes(graph: Graph | null, clusters: ClustersI): Set<string> {
        if (!graph) return new Set();
        const graph_nodes = new Set(graph.nodes());
        const clustered_nodes = clusters.getAllClusterNodesRecursive();

        const unclustered_nodes = graph_nodes.difference(clustered_nodes);
        return unclustered_nodes;
    }

    function searchGraphForNodes(graph: Graph | null, query: string): string[] {
        const results: string[] = [];
        if (query.trim() === "") return [...unclustered_nodes];
        if (!graph) return results;

        for (const node of unclustered_nodes) {
            const attrs = graph.getNodeAttributes(node);
            if (!attrs) continue;
            if (nodeMatch(attrs, query)) {
                results.push(node);
            }
        }

        return results;
    }

    function getNodeFullPath(graph: Graph | null, n_id: string): string {
        const res = n_id;
        return res;
    }

    function getNodeLabel(graph: Graph | null, n_id: string): string {
        const res = graph?.getNodeAttribute(n_id, 'label') || n_id;
        return res;
    }

    $: unclustered_nodes = getUnclusteredNodes(graph, clusters);
    $: filtered_unclustered = searchGraphForNodes(graph, query);
</script>

<div class="pane left-pane">
    <header class="pane-header">
        <span class="pane-title">Unclustered Nodes</span>
        <span class="pane-count">{filtered_unclustered.length}</span>
    </header>

    <div class="filter-row">
        <span class="filter-icon">⌕</span>
        <input
            class="filter-input"
            type="text"
            placeholder="Filter nodes…"
            bind:value={query}
            spellcheck="false"
        />
        {#if query}
            <button class="clear-btn" on:click={() => (query = "")}>✕</button>
        {/if}
    </div>

    <div class="list-box">
        {#if filtered_unclustered.length === 0}
            <div class="empty-state">
                {query ? "No matches found" : "All nodes are clustered"}
            </div>
        {:else}
            {#each filtered_unclustered as id (id)}
                <!-- title={attrs.full_path || id} -->
                <div class="node-row" title={getNodeFullPath(graph, id)}>
                    <span class="node-id">{getNodeLabel(graph, id)}</span>
                    <!-- <span class="node-label">{attrs.label}</span>
                    <span class="node-type-badge">{attrs.type}</span> -->
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    /* ── Pane header ── */
 
    .pane-count {
        font-size: 10px;
        color: var(--text);
        background: var(--border);
        border-radius: 10px;
        padding: 1px 7px;
        font-family: var(--font-ui);
    }
 
    /* ── Unclustered node rows (left pane) ── */
    .node-row {
        display: flex;
        align-items: center;
        gap: 1px;
        padding: 3px 14px;
        cursor: default;
        transition: background 0.1s;
        min-width: 0;

        &:hover {
            background: var(--surface-hover);
        }
    }
 
    /* .node-icon {
        font-size: 12px;
        flex-shrink: 0;
        color: var(--text-muted);
    }
 
    .node-icon[data-type="file"]             { color: #3b7cf4; }
    .node-icon[data-type="folder"]           { color: #f4a23b; }
    .node-icon[data-type="class"]            { color: #7c5af4; }
    .node-icon[data-type="function"],
    .node-icon[data-type="method"]           { color: #3bf4b2; }
    .node-icon[data-type="external_library"] { color: #f45a9a; }
 
    .node-label {
        flex: 1;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--text);
    }
 
    .node-type-badge {
        font-size: 10px;
        color: var(--text-dim);
        flex-shrink: 0;
        font-family: var(--font-ui);
    } */

</style>
