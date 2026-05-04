<script lang="ts">
    import type { ClustersI, Graph } from "@dep-graph-vis/core";
    import type { TreeNode } from "./tree";
    import {
        chevronSvg,
        folderIconClosed,
        folderIconOpen,
        getNodeIcon,
    } from "./icons";

    export let treeNode: TreeNode;
    export let clusters: ClustersI;
    export let graph: Graph | null;
    export let depth: number = 0;
    export let localExpanded: Record<string, boolean>;
    export let filterQuery: string = "";

    $: isExpanded =
        treeNode.kind === "cluster"
            ? (localExpanded[treeNode.cluster.id] ?? true)
            : false;

    function toggleExpanded() {
        if (treeNode.kind !== "cluster") return;
        localExpanded = {
            ...localExpanded,
            [treeNode.cluster.id]: !localExpanded[treeNode.cluster.id],
        };
    }

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

    $: visibleChildren =
        treeNode.kind === "cluster"
            ? filterQuery
                ? treeNode.children.filter((c) => matchesFilter(c, filterQuery))
                : treeNode.children
            : [];

    // Depth-based indent colors cycling
    const INDENT_COLORS = [
        "#3b7cf4",
        "#7c5af4",
        "#f45a9a",
        "#f4a23b",
        "#3bf4b2",
    ];
    $: indentColor = INDENT_COLORS[depth % INDENT_COLORS.length];

    // Indent width matches VS Code: 8px per level
    const INDENT_PX = 8;
</script>

{#if treeNode.kind === "cluster"}
    {@const cluster = treeNode.cluster}
    <div class="tree-item-wrap">
        <!-- Row -->
        <div
            class="tree-row"
            style="padding-left: {depth * INDENT_PX + 4}px"
            on:click={toggleExpanded}
            on:keydown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggleExpanded()}
            role="button"
            tabindex="0"
            title={cluster.label}
        >
            <!-- Chevron (always present for clusters) -->
            <span class="chevron" class:expanded={isExpanded}>
                {@html chevronSvg(isExpanded)}
            </span>

            <!-- Folder icon -->
            <span class="item-icon">
                {@html isExpanded ? folderIconOpen() : folderIconClosed()}
            </span>

            <!-- Label -->
            <span class="item-label">{cluster.label}</span>

            <!-- Badges -->
            <span class="item-badges">
                {#if !cluster.expanded}
                    <span class="badge-collapsed" title="Collapsed in graph"
                        >●</span
                    >
                {/if}
            </span>
        </div>

        <!-- Children -->
        {#if isExpanded}
            <div class="tree-children">
                {#each visibleChildren as child (child.kind === "cluster" ? child.cluster.id : child.id)}
                    <svelte:self
                        treeNode={child}
                        {clusters}
                        {graph}
                        depth={depth + 1}
                        bind:localExpanded
                        {filterQuery}
                        on:addToCluster
                        on:removeFromCluster
                        on:createCluster
                    />
                {/each}
            </div>
        {/if}
    </div>
{:else}
    {@const attrs = treeNode.attrs}
    {@const icon = getNodeIcon(attrs.type, false, false)}
    <div
        class="tree-row leaf"
        style="padding-left: {depth * INDENT_PX + 4 + 16}px"
        title={attrs.full_path || treeNode.id}
        tabindex="0"
        role="treeitem"
    >
        <!-- No chevron for leaves -->
        <span class="item-icon">
            {@html icon.svg}
        </span>
        <span class="item-label leaf-label">{attrs.label}</span>
        <span class="item-badges">
            <span class="type-tag">{attrs.type}</span>
        </span>
    </div>
{/if}

<style lang="scss">
    /* ── VS Code Dark+ token colors ── */
    .tree-item-wrap {
        --vsc-bg: #1e1e1e;
        --vsc-row-height: 22px;
        --vsc-hover: #2a2d2e;
        --vsc-focus: #04395e;
        --vsc-focus-border: #007fd4;
        --vsc-text: #cccccc;
        --vsc-text-dim: #6a737d;
        --vsc-text-muted: #858585;
        --vsc-chevron: #c5c5c5;
        --vsc-indent-guide: #404040;
        --font: -apple-system, "Segoe WPC", "Segoe UI", sans-serif;
        --font-size: 13px;
    }

    /* ── Row base ── */
    .tree-row {
        display: flex;
        align-items: center;
        height: var(--vsc-row-height);
        min-height: var(--vsc-row-height);
        cursor: pointer;
        user-select: none;
        color: var(--vsc-text);
        font-family: var(--font);
        font-size: var(--font-size);
        white-space: nowrap;
        outline: none;
        position: relative;
        gap: 0;
        /* Right padding so badges don't hug the edge */
        padding-right: 12px;
    }

    .tree-row:hover {
        background: var(--vsc-hover);
    }

    .tree-row:focus-visible {
        outline: 1px solid var(--vsc-focus-border);
        outline-offset: -1px;
    }

    /* ── Chevron ── */
    .chevron {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        color: var(--vsc-chevron);
        opacity: 0.7;
        margin-right: 2px;
        transition: opacity 0.1s;
    }

    .tree-row:hover .chevron {
        opacity: 1;
    }

    /* ── Icons ── */
    .item-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        margin-right: 6px;
    }

    /* ── Label ── */
    .item-label {
        flex: 1;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: var(--vsc-row-height);
    }

    .leaf-label {
        color: var(--vsc-text);
        opacity: 0.85;
    }

    /* ── Badges / trailing info ── */
    .item-badges {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: 4px;
        flex-shrink: 0;
    }

    .badge-collapsed {
        font-size: 7px;
        color: #d19a66;
        opacity: 0.75;
        line-height: 1;
    }

    .type-tag {
        font-size: 11px;
        color: var(--vsc-text-dim);
        font-family: var(--font);
    }

    /* ── Children container with indent guide ── */
    .tree-children {
        position: relative;
    }

    /* The vertical indent guide line — drawn as a ::before pseudo on the children
       container, positioned at the chevron centre of the parent row. */
    .tree-children::before {
        content: "";
        position: absolute;
        left: 11px; /* aligns with chevron center at depth 0; children offset themselves */
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--vsc-indent-guide);
        pointer-events: none;
    }

    /* Leaf row cursor */
    .tree-row.leaf {
        cursor: default;
    }

    .tree-row.leaf:focus-visible {
        background: var(--vsc-focus);
        outline: 1px solid var(--vsc-focus-border);
        outline-offset: -1px;
    }
</style>
