<script lang="ts">
    import type { ClustersI, Graph } from "@dep-graph-vis/core";
    import type { TreeNode } from "./tree";

    export let treeNode: TreeNode;
    export let clusters: ClustersI;
    export let graph: Graph | null;
    export let depth: number = 0;
    export let localExpanded: Record<string, boolean>;
    export let filterQuery: string = "";

    function nodeIcon(type: string): string {
        const icons: Record<string, string> = {
            file: "◻",
            folder: "◈",
            class: "⬡",
            function: "ƒ",
            method: "⊛",
            external_library: "⬡",
            root: "⌂",
        };
        return icons[type] ?? "◦";
    }

    function folderIconOpen(): string {
        // Open folder — matches VS Code's folder-opened codicon shape
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 4H7.707L6.354 2.646A.5.5 0 0 0 6 2.5H1.5A1.5 1.5 0 0 0 0 4v.5z" fill="#C09553"/>
  <path d="M0 5.5v7A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 4H1.5A1.5 1.5 0 0 0 0 5.5z" fill="#E9B959"/>
</svg>`;
    }

    function folderIconClosed(): string {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 4H7.707L6.354 2.646A.5.5 0 0 0 6 2H1.5z" fill="#C09553"/>
</svg>`;
    }

    // Node type → { icon SVG string, color }
    function getNodeIcon(
        type: string,
        isCluster = false,
        expanded = false,
    ): { svg: string; color: string } {
        if (isCluster) {
            return {
                svg: expanded ? folderIconOpen() : folderIconClosed(),
                color: "transparent", // color baked into SVG
            };
        }
        switch (type) {
            case "file":
                return { svg: fileIcon("#6FB3D2"), color: "#6FB3D2" };
            case "folder":
                return {
                    svg: expanded ? folderIconOpen() : folderIconClosed(),
                    color: "transparent",
                };
            case "class":
                return { svg: classIcon(), color: "transparent" };
            case "function":
            case "method":
                return { svg: fnIcon(), color: "transparent" };
            case "external_library":
                return { svg: libIcon(), color: "transparent" };
            default:
                return { svg: fileIcon("#A0A0A0"), color: "#A0A0A0" };
        }
    }

    function fileIcon(color: string): string {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 1H3.5A1.5 1.5 0 0 0 2 2.5v11A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V6L9 1z" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1"/>
  <path d="M9 1v4.5A.5.5 0 0 0 9.5 6H14" stroke="${color}" stroke-width="1"/>
</svg>`;
    }

    function classIcon(): string {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="14" height="14" rx="2" fill="#CC6699" fill-opacity="0.2" stroke="#CC6699" stroke-width="1"/>
  <text x="8" y="11.5" font-family="monospace" font-size="9" font-weight="bold" fill="#CC6699" text-anchor="middle">C</text>
</svg>`;
    }

    function fnIcon(): string {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="14" height="14" rx="2" fill="#75BFFF" fill-opacity="0.15" stroke="#75BFFF" stroke-width="1"/>
  <text x="8" y="11.5" font-family="monospace" font-size="9" font-weight="bold" fill="#75BFFF" text-anchor="middle">ƒ</text>
</svg>`;
    }

    function libIcon(): string {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="8" cy="8" r="6.5" fill="#4EC9B0" fill-opacity="0.15" stroke="#4EC9B0" stroke-width="1"/>
  <circle cx="8" cy="8" r="2.5" fill="#4EC9B0" fill-opacity="0.5"/>
</svg>`;
    }

    // ── Chevron SVG ─────────────────────────────────────────────────────────
    // Matches VS Code's tree-item-expanded / collapsed codicons exactly
    function chevronSvg(expanded: boolean): string {
        if (expanded) {
            // pointing down
            return `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
        } else {
            // pointing right
            return `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
        }
    }

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
        title: "Collapsed in graph";
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
