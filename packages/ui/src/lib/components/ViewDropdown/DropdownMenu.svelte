<script lang="ts">
    import type { DropdownItem } from "../reusable_components/dropdown";
    import DropdownConfigureWindow from "./DropdownConfigureWindow.svelte";
    import DropdownSearchBox from "./DropdownSearchBox.svelte";
    import type { Snippet } from "svelte";
    import ViewMenu from "./ViewMenu.svelte";
    import ViewEditor from "./ViewEditor.svelte";

    export let items: DropdownItem[] = [];
    export let placeholder: string = "Select an item...";
    export let selected: string | null = null;
    export let addNewCallback: (() => void) | null = null;
    export let selectCallback: ((id: string) => void) | null = null;
    export let title: string | undefined;
    export let configure: Snippet<[DropdownItem]>;

    let isOpen: boolean = false;
    let searchQuery: string = "";
    let configItem: DropdownItem | null = null;

    $: filteredItems = items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    $: selectedLabel = selected
        ? (items.find((i) => i.value === selected)?.label ?? placeholder)
        : placeholder;

    function openDropdown(): void {
        isOpen = true;
        searchQuery = "";
        configItem = null;
    }

    function closeDropdown(): void {
        isOpen = false;
        configItem = null;
    }

    function selectItem(item: DropdownItem): void {
        selected = item.value;
        selectCallback?.(item.value);
        closeDropdown();
    }

    function openConfig(event: MouseEvent, item: DropdownItem): void {
        event.stopPropagation();
        configItem = item;
    }

    function backToDropdown(): void {
        configItem = null;
    }

    function addNewItem(): void {
        addNewCallback?.();
    }
</script>

<div class="dropdown-wrapper">
    <button class="trigger" on:click={openDropdown} {title}>
        <span class="trigger-label">{selectedLabel}</span>
        <span class="trigger-chevron">▾</span>
    </button>

    {#if isOpen}
        <div
            class="backdrop"
            role="none"
            on:click={closeDropdown}
            on:keydown={() => {}}
        ></div>

        <div class="panel">
            {#if configItem !== null}
                <DropdownConfigureWindow
                    title="Configure View"
                    back={backToDropdown}
                    close={closeDropdown}
                >
                    <ViewMenu slot="menu" view_id={configItem.value}/>
                    <svelte:fragment slot="content">
                        <ViewEditor item={configItem} />
                        <!-- {#if configure}
                            {@render configure(configItem)}
                        {/if} -->
                    </svelte:fragment>
                </DropdownConfigureWindow>
            {:else}
                <!-- Search box -->
                <DropdownSearchBox bind:searchQuery />

                <hr class="divider" />

                <!-- Item list -->
                <ul class="list" role="listbox">
                    {#each filteredItems as item (item.value)}
                        <li
                            class="list-item"
                            role="option"
                            aria-selected={item.value === selected}
                        >
                            <button
                                class="item-select"
                                on:click={() => selectItem(item)}
                            >
                                {item.label}
                                {#if item.value === selected}
                                    <span class="checkmark">✓</span>
                                {/if}
                            </button>
                            <button
                                class="item-config-btn"
                                title="Configure {item.label}"
                                on:click={(e) => openConfig(e, item)}
                            >
                                <span class="config-chevron">›</span>
                            </button>
                        </li>
                    {/each}
                    {#if filteredItems.length === 0}
                        <li class="list-empty">
                            No items match "{searchQuery}"
                        </li>
                    {/if}
                </ul>

                <hr class="divider" />

                <!-- Add new button -->
                <div class="add-row">
                    <button class="add-btn" on:click={addNewItem}>
                        <svg class="add-icon" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M10 4v12M4 10h12"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                            />
                        </svg>
                        Add new View
                    </button>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    .dropdown-wrapper {
        position: relative;
        display: flex;
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        font-size: 14px;
    }

    /* Trigger */
    .trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        min-width: 220px;
        background: var(--button-bg-color);
        border: 1px solid transparent;
        border-radius: 8px;
        font-size: 14px;
        color: var(--font-color);
        user-select: none;

        &:hover {
            border-color: var(--border-highlight-color);
        }

        &:focus-visible {
            outline: 2px solid var(--border-highlight-color);
            outline-offset: 2px;
        }
    }

    .trigger-label {
        flex: 1;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .trigger-chevron {
        font-size: 11px;
        color: #9ca3af;
        flex-shrink: 0;
    }

    /* Backdrop */
    .backdrop {
        position: fixed;
        inset: 0;
        z-index: 49;
    }

    /* Panel */
    .panel {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        z-index: 50;
        min-width: 280px;
        background: var(--bg-color-2);
        border: 1px solid #323232;
        border-radius: 10px;
        box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.06);
        overflow: hidden;
    }

    /* Divider */
    .divider {
        margin: 0;
        border: none;
        border-top: 1px solid #323232;
    }

    /* List */
    .list {
        list-style: none;
        padding-bottom: 4px;
        padding-top: 4px;
        padding-left: 6px;
        margin: 0;
        max-height: 240px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #e5e7eb transparent;

        &::-webkit-scrollbar {
            width: 5px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: #e5e7eb;
            border-radius: 4px;
        }
    }

    .list-item {
        display: flex;
        align-items: center;
    }

    .list-item[aria-selected="true"] .item-select {
        color: var(--border-highlight-color);
        font-weight: 500;
    }

    .item-select {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding: 9px 12px;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        font-size: 14px;
        color: var(--font-color);
        transition: background 0.1s ease;

        &:hover {
            background: var(--option-hover-color);
        }
    }

    .checkmark {
        font-size: 12px;
        color: var(--border-highlight-color);
    }

    .item-config-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: none;
        border: none;
        cursor: pointer;
        color: #d1d5db;
        transition:
            color 0.15s ease,
            background 0.1s ease;
        border-radius: 6px;
        margin-right: 4px;

        &:hover {
            color: var(--border-highlight-color);
            background: var(--option-hover-color);
        }
    }

    .config-chevron {
        font-size: 20px;
        line-height: 1;
        font-weight: 300;
    }

    .list-empty {
        padding: 12px;
        color: #9ca3af;
        font-size: 13px;
        font-style: italic;
        text-align: center;
    }

    /* Add row */
    .add-row {
        padding: 4px 8px 6px;
    }

    .add-btn {
        gap: 7px;
        width: 100%;
        padding: 9px 10px;
        background: none;
        font-size: 14px;
        color: var(--font-color-1);
        font-weight: 500;
        border-radius: 6px;

        // &:hover {
        //     background: #f5f3ff;
        // }
    }

    .add-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }
</style>
