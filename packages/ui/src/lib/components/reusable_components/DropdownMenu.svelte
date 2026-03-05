<script lang="ts">
    import ConfigureWindow from "./DropdownConfigureWindow.svelte";
    import DropdownSearchBox from "./DropdownSearchBox.svelte";

    export let items: { id: string; label: string }[] = [];
    export let placeholder: string = "Select an item...";
    export let selected: string | null = null;

    let isOpen: boolean = false;
    let searchQuery: string = "";
    let configItem: { id: string; label: string } | null = null;

    $: filteredItems = items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    $: selectedLabel = selected
        ? (items.find((i) => i.id === selected)?.label ?? placeholder)
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

    function selectItem(item: { id: string; label: string }): void {
        selected = item.id;
        closeDropdown();
    }

    function openConfig(
        event: MouseEvent,
        item: { id: string; label: string },
    ): void {
        event.stopPropagation();
        configItem = item;
    }

    function backToDropdown(): void {
        configItem = null;
    }

    function addNewItem(): void {
        items = [
            ...items,
            { id: crypto.randomUUID(), label: `New Item ${items.length + 1}` },
        ];
    }
</script>

<div class="dropdown-wrapper">
    <button class="trigger" on:click={openDropdown}>
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
                <ConfigureWindow
                    title={configItem.label}
                    on:back={backToDropdown}
                    on:close={closeDropdown}
                >
                    <slot name="configure" item={configItem}>
                        <p class="default-config-content">
                            Configure <strong>{configItem.label}</strong>
                        </p>
                    </slot>
                </ConfigureWindow>
            {:else}
                <!-- Search box -->
                <DropdownSearchBox bind:searchQuery />

                <hr class="divider" />

                <!-- Item list -->
                <ul class="list" role="listbox">
                    {#each filteredItems as item (item.id)}
                        <li
                            class="list-item"
                            role="option"
                            aria-selected={item.id === selected}
                        >
                            <button
                                class="item-select"
                                on:click={() => selectItem(item)}
                            >
                                {item.label}
                                {#if item.id === selected}
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
                        Add new item
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
        cursor: pointer;
        font-size: 14px;
        color: var(--font-color);
        transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
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
        background: var(--bg-color-1);
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
        margin: 0;
        padding: 4px 0;
        max-height: 240px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #e5e7eb transparent;
    }

    .list::-webkit-scrollbar {
        width: 5px;
    }
    .list::-webkit-scrollbar-track {
        background: transparent;
    }
    .list::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 4px;
    }

    .list-item {
        display: flex;
        align-items: center;
    }

    .list-item[aria-selected="true"] .item-select {
        color: #6366f1;
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
    }

    .item-select:hover {
        background: #f9fafb;
    }

    .checkmark {
        font-size: 12px;
        color: #6366f1;
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
    }

    .item-config-btn:hover {
        color: #6366f1;
        background: #f5f3ff;
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
        display: flex;
        align-items: center;
        gap: 7px;
        width: 100%;
        padding: 9px 10px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: #6366f1;
        font-weight: 500;
        border-radius: 6px;
        transition: background 0.1s ease;
    }

    .add-btn:hover {
        background: #f5f3ff;
    }

    .add-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }

    .default-config-content {
        padding: 16px;
        color: #6b7280;
        font-size: 14px;
        margin: 0;
    }
</style>
