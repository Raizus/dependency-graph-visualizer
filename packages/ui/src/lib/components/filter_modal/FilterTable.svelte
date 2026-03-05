<script lang="ts">
    import type { FilterI } from "@dep-graph-vis/core";
    import TableCheckbox from "./TableCheckbox..svelte";
    import { getContext } from "svelte";
    import type { StateStore } from "../../StateStore";

    const state_store = getContext<StateStore>("state_store");
    let { current_view } = state_store;
    $: filters = $current_view.filters;

    let selectedId: string | number | null = null;

    function selectRow(id: string | number) {
        selectedId = selectedId === id ? null : id;
    }

    function getSelectedIndex(selected: string | number | null): number {
        return filters.findIndex((item) => item.id === selected);
    }

    // Placeholder global state functions
    function onReorder(newItems: FilterI[]) {
        console.log("Global state: items reordered", newItems);
        // TODO: dispatch to global store
    }

    function onToggleApplied(id: string | number, value: boolean) {
        console.log("Global state: toggled applied", { id, value });
        // TODO: dispatch to global store
    }

    function onToggleShow(id: string | number, value: boolean) {
        console.log("Global state: toggled show", { id, value });
        // TODO: dispatch to global store
    }

    function moveUp() {
        const idx = getSelectedIndex(selectedId);
        if (idx <= 0) return;
        const newFilters = [...filters];
        [newFilters[idx - 1], newFilters[idx]] = [
            newFilters[idx],
            newFilters[idx - 1],
        ];
        filters = newFilters;
        onReorder(filters);
    }

    function moveDown() {
        const idx = getSelectedIndex(selectedId);
        if (idx < 0 || idx >= filters.length - 1) return;
        const newItems = [...filters];
        [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
        filters = newItems;
        onReorder(filters);
    }

    function handleAppliedChange(item: FilterI, value: boolean) {
        item.applied = value;
        filters = [...filters];
        onToggleApplied(item.id, value);
    }

    function handleShowChange(item: FilterI, value: boolean) {
        item.show = value;
        filters = [...filters];
        onToggleShow(item.id, value);
    }

    $: selectedIndex = getSelectedIndex(selectedId);
    $: canMoveUp = selectedIndex > 0;
    $: canMoveDown = selectedIndex >= 0 && selectedIndex < filters.length - 1;

    $: console.log(canMoveUp);
    $: console.log(canMoveDown);
</script>

<div class="container">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Label</th>
                    <th>Applied</th>
                    <th>Show</th>
                </tr>
            </thead>
            <tbody>
                {#each filters as filter (filter.id)}
                    <tr
                        class="row"
                        class:selected={filter.id === selectedId}
                        on:click={() => selectRow(filter.id)}
                    >
                        <td class="label-cell">{filter.label}</td>
                        <td class="checkbox-cell">
                            <TableCheckbox
                                checked={filter.applied}
                                onChange={(v) => handleAppliedChange(filter, v)}
                            />
                        </td>
                        <td class="checkbox-cell">
                            <TableCheckbox
                                checked={filter.show}
                                onChange={(v) => handleShowChange(filter, v)}
                            />
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="button-panel">
        <button
            class="order-btn"
            on:click={moveUp}
            disabled={!canMoveUp}
            title="Move Up"
        >
            ▲ Up
        </button>
        <button
            class="order-btn"
            on:click={moveDown}
            disabled={!canMoveDown}
            title="Move Down"
        >
            ▼ Down
        </button>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 12px;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
    }

    .table-wrapper {
        border: 1px solid #d0d5dd;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        min-width: 320px;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        background-color: #ffffff;
    }

    thead tr {
        background-color: #f2f4f7;
    }

    th {
        padding: 10px 14px;
        text-align: left;
        font-weight: 600;
        color: #344054;
        border-bottom: 1px solid #d0d5dd;
        user-select: none;

        &:not(:first-child) {
            text-align: center;
        }
    }

    .row {
        cursor: pointer;
        transition: background-color 0.12s ease;

        &:hover {
            background-color: #f9fafb;
        }

        &.selected {
            background-color: #eff4ff;
        }

        &.selected td {
            color: #3538cd;
        }
    }

    td {
        padding: 10px 14px;
        color: #475467;
        border-bottom: 1px solid #eaecf0;
    }

    .row:last-child td {
        border-bottom: none;
    }

    .label-cell {
        white-space: nowrap;
    }

    .checkbox-cell {
        text-align: center;
    }

    .button-panel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 4px;
    }

    .order-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 80px;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 500;
        user-select: none;
    }
</style>
