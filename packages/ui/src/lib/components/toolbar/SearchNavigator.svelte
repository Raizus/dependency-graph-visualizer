<script lang="ts">
    import { getContext } from "svelte";
    import type { StateStore } from "../../StateStore";
    import { get } from "svelte/store";

    // Define the props
    export let placeholder: string = "Search nodes...";
    export let onCurrentItemChange:
        | ((item: string | null) => void)
        | undefined = undefined;

    // Component state
    let search_query: string = "";
    let current_idx: number = 0;
    let current_node: string | null = null;
    let filtered_results: string[] = [];
    let is_focused: boolean = false;
    let suggestion_highlighted_idx: number = -1;

    interface Suggestion {
        id: string;
        label: string;
    }

    const state_store = getContext<StateStore>("state_store");

    // Top 10 suggestions derived from filtered results
    $: suggestions = buildSuggestions(filtered_results);

    // Show suggestion box only when focused and query is non-empty
    $: show_suggestions =
        is_focused && search_query.trim() !== "" && suggestions.length > 0;

    // update current item on current index update
    $: current_node =
        current_idx >= 0 && current_idx < filtered_results.length
            ? filtered_results[current_idx]
            : null;

    // set selection to current node
    $: if (current_node) {
        state_store.setSelectedNodes([current_node]);
        const renderer = get(state_store.renderer);
        renderer?.fitToNodes([current_node]);
    }

    // Reactive statement to filter results whenever search_query changes
    $: {
        filtered_results = state_store.searchFilteredGraphNodes(search_query);
        current_idx = filtered_results.length > 0 ? 0 : -1;
        suggestion_highlighted_idx = -1;
    }

    // Call the callback whenever the current item changes
    $: {
        if (current_node !== null && onCurrentItemChange) {
            onCurrentItemChange(current_node);
        }
    }

    function buildSuggestions(filter_results: string[]): Suggestion[] {
        const suggestions: Suggestion[] = [];

        const graph = get(state_store.filtered_clustered_graph);
        if (!graph) return suggestions;

        for (const node_id of filter_results) {
            const node_label = graph?.getNodeAttribute(node_id, "label");
            if (!node_label) continue;

            suggestions.push({
                id: node_id,
                label: node_label,
            });
        }

        return suggestions;
    }

    // Navigation functions
    function navigateNext(): void {
        if (filtered_results.length > 0) {
            current_idx = (current_idx + 1) % filtered_results.length;
        }
    }

    function navigatePrevious(): void {
        if (filtered_results.length > 0) {
            current_idx =
                current_idx === 0
                    ? filtered_results.length - 1
                    : current_idx - 1;
        }
    }

    function selectSuggestion(suggestion: Suggestion): void {
        const idx = filtered_results.indexOf(suggestion.id);
        if (idx !== -1) {
            current_idx = idx;
            search_query = suggestion.label;
        }
        is_focused = false;
    }

    // Handle keyboard navigation
    function handleKeydown(event: KeyboardEvent): void {
        if (show_suggestions) {
            if (event.key === "ArrowDown") {
                suggestion_highlighted_idx = Math.min(
                    suggestion_highlighted_idx + 1,
                    suggestions.length - 1,
                );
                event.preventDefault();
                return;
            }
            if (event.key === "ArrowUp") {
                suggestion_highlighted_idx = Math.max(
                    suggestion_highlighted_idx - 1,
                    -1,
                );
                event.preventDefault();
                return;
            }
            if (event.key === "Escape") {
                is_focused = false;
                event.preventDefault();
                return;
            }
            if (event.key === "Enter" && suggestion_highlighted_idx >= 0) {
                selectSuggestion(suggestions[suggestion_highlighted_idx]);
                event.preventDefault();
                return;
            }
        }

        if (event.key === "Enter") {
            if (event.shiftKey) {
                navigatePrevious();
            } else {
                navigateNext();
            }
            event.preventDefault();
        }
    }

    function handleFocus(): void {
        is_focused = true;
    }

    function handleBlur(): void {
        // Delay so click on suggestion registers before hiding
        setTimeout(() => {
            is_focused = false;
        }, 150);
    }
</script>

<div class="search-container">
    <div class="search-bar" class:focused={is_focused}>
        <input
            type="text"
            bind:value={search_query}
            on:keydown={handleKeydown}
            on:focus={handleFocus}
            on:blur={handleBlur}
            {placeholder}
            class="search-input"
        />

        <div class="search-controls">
            <span class="result-counter">
                {#if search_query.trim() === "" || filtered_results.length === 0}
                    No results
                {:else}
                    {current_idx + 1} of {filtered_results.length}
                {/if}
            </span>

            <button
                class="nav-button"
                on:click={navigatePrevious}
                disabled={filtered_results.length === 0}
                aria-label="Previous result"
                title="Previous (Shift + Enter)"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M8 12L4 8L8 4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M8 8L12 4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M8 8L12 12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>

            <button
                class="nav-button"
                on:click={navigateNext}
                disabled={filtered_results.length === 0}
                aria-label="Next result"
                title="Next (Enter)"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M8 4L12 8L8 12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M8 8L4 12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M8 8L4 4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
        </div>
    </div>

    {#if show_suggestions}
        <ul
            class="suggestions-box"
            role="listbox"
            aria-label="Search suggestions"
        >
            {#each suggestions as suggestion, i}
                <li
                    class="suggestion-item"
                    class:highlighted={i === suggestion_highlighted_idx}
                    class:active={suggestion.id === current_node}
                    role="option"
                    aria-selected={suggestion.id === current_node}
                    on:mousedown|preventDefault={() =>
                        selectSuggestion(suggestion)}
                    on:mouseover={() => (suggestion_highlighted_idx = i)}
                    on:focus={() => (suggestion_highlighted_idx = i)}
                >
                    <span class="suggestion-label">{suggestion.label}</span>
                </li>
            {/each}

            {#if filtered_results.length > 10}
                <li class="suggestions-overflow">
                    +{filtered_results.length - 10} more — keep typing to narrow down
                </li>
            {/if}
        </ul>
    {/if}
</div>

<style lang="scss">
    .search-container {
        max-width: 600px;
        font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        background: var(--button-bg-color);
        position: relative;
    }

    .search-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border: 2px solid #131313;
        border-radius: 8px;
        transition: border-color 0.2s;

        &.focused {
            border-color: var(--border-highlight-color);
        }
    }

    .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 16px;
        padding: 4px;
        background: transparent;

        &::placeholder {
            color: #999;
        }
    }

    .search-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .result-counter {
        font-size: 14px;
        color: #666;
        white-space: nowrap;
        padding: 0 4px;
        min-width: 60px;
        width: 6rem;
        text-align: right;
    }

    .nav-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        color: #666;
        transition: all 0.2s;
        padding: 0;

        &:hover:not(:disabled) {
            background: #f0f0f0;
            color: #333;
        }

        &:active:not(:disabled) {
            background: #e0e0e0;
        }

        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
    }

    /* Suggestion box */
    .suggestions-box {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        margin: 0;
        padding: 4px 0;
        list-style: none;
        background: var(--button-bg-color, #fff);
        border: 1px solid black;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        z-index: 100;
        overflow: hidden;
    }

    .suggestion-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.1s;

        &.highlighted {
            background: var(--option-hover-color);
        }

        &.active {
            color: var(--border-highlight-color, #131313);
            font-weight: 600;
        }
    }

    .suggestion-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .suggestions-overflow {
        padding: 5px 12px;
        font-size: 12px;
        color: #999;
        border-top: 1px solid #eee;
        text-align: center;
        font-style: italic;
        cursor: default;
    }
</style>
