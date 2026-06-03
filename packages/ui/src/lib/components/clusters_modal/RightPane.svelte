<script lang="ts">
    import type {
        ClustersI,
        Graph,
    } from "@dep-graph-vis/core";
    import ClusterTreeNode from "./ClusterTreeNode.svelte";
    import { buildTree, type TreeNode } from "./tree";

    export let clusters: ClustersI;
    export let base_graph: Graph | null;
    export let clustered_graph: Graph | null;

    let query: string = "";
    let localExpanded: Record<string, boolean> = {};

    $: rootTree = base_graph && clustered_graph
        ? buildTree(base_graph, clustered_graph, clusters, undefined)
        : ([] as TreeNode[]);

    function matchesFilter(node: TreeNode, q: string): boolean {
        if (!q) return true;
        if (node.kind === "node") {
            return (
                node.attrs.label.toLowerCase().includes(q) ||
                node.id.toLowerCase().includes(q)
            );
        }
        return (
            node.cluster.label.toLowerCase().includes(q) ||
            node.children.some((c) => matchesFilter(c, q))
        );
    }

    $: filteredTree = (() => {
        const q = query.trim().toLowerCase();
        if (!q) return rootTree;
        return rootTree.filter((n) => matchesFilter(n, q));
    })();

    function updateLocalExpanded(
        localExpanded: Record<string, boolean>,
        clusters: ClustersI,
    ): Record<string, boolean> {
        const all = clusters.getAllClusters();
        const next: Record<string, boolean> = { ...localExpanded };

        for (const c of all) {
            if (!(c.id in next)) {
                next[c.id] = c.expanded ?? true;
            }
        }
        // Prune removed clusters
        for (const id of Object.keys(next)) {
            if (!clusters.hasCluster(id)) delete next[id];
        }
        return next;
    }

    $: updateLocalExpanded(localExpanded, clusters);
</script>

<!-- ── RIGHT PANE ── -->
<div class="pane right-pane">
    <header class="pane-header">
        <span class="pane-title">Cluster Tree</span>
        <!-- <span class="pane-count">{clusters.getAllClusters().length}</span> -->
    </header>

    <div class="filter-row">
        <span class="filter-icon">⌕</span>
        <input
            class="filter-input"
            type="text"
            placeholder="Filter clusters & nodes…"
            bind:value={query}
            spellcheck="false"
        />
        {#if query}
            <button class="clear-btn" on:click={() => (query = "")}>✕</button>
        {/if}
    </div>

    <div class="list-box">
        {#each rootTree as node (node.kind === "cluster" ? node.cluster.id : node.id)}
            <ClusterTreeNode
                treeNode={node}
                {clusters}
                graph={base_graph}
                depth={0}
                bind:localExpanded
                filterQuery={query.trim().toLowerCase()}
                on:addToCluster
                on:removeFromCluster
                on:createCluster
            />
        {/each}
        <!-- {#if filteredTree.length === 0}
            <div class="empty-state">
                {query ? "No matches found" : "No clusters defined"}
            </div>
        {:else}
            {#each filteredTree as node (node.kind === "cluster" ? node.cluster.id : node.id)}
                <ClusterTreeNode
                    treeNode={node}
                    {clusters}
                    {graph}
                    depth={0}
                    bind:localExpanded
                    filterQuery={rightFilter.trim().toLowerCase()}
                    on:addToCluster
                    on:removeFromCluster
                    on:createCluster
                />
            {/each}
        {/if} -->
    </div>
</div>

<style lang="scss">
</style>
