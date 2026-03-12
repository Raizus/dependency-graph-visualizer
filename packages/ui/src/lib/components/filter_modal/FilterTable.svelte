<script lang="ts">
    import type { FilterI } from "@dep-graph-vis/core";
    import TableCheckbox from "./TableCheckbox..svelte";
    import { getContext } from "svelte";
    import type { StateStore } from "../../StateStore";

    const state_store = getContext<StateStore>("state_store");
    let { current_view: current_view_store } = state_store;
    $: filters = $current_view_store.filters;

    let selected_id: string | null = null;
    let selectedIdx: number | null = null;
    // $: console.log("Selected filter index:", selectedIdx);

    function getSelectedIdx(selected_id: string | null) {
        if (!selected_id) return null;
        const idx = filters.findIndex(filter => filter.id === selected_id);
        return idx;
    }

    function selectRow(filter_id: string) {
        selected_id = filter_id;
        selectedIdx = getSelectedIdx(selected_id);
    }

    // Placeholder global state functions
    function onReorder() {
        selectedIdx = getSelectedIdx(selected_id);
    }

    function onToggleApplied(idx: number, value: boolean) {
        console.log("Global state: toggled applied", { idx, value });
        state_store.filterSetApplied(idx, value);
    }

    function onToggleShow(id: string | number, value: boolean) {
        console.log("Global state: toggled show", { id, value });
        // TODO: dispatch to global store
    }

    function moveUp() {
        if (selectedIdx === null) return
        state_store.filterMoveUp(selectedIdx);
        onReorder();
    }

    function moveDown() {
        if (selectedIdx === null) return
        state_store.filterMoveDown(selectedIdx);
        onReorder();
    }

    function handleAppliedChange(idx: number, value: boolean) {
        onToggleApplied(idx, value);
    }

    function handleShowChange(item: FilterI, value: boolean) {
        item.show = value;
        filters = [...filters];
        onToggleShow(item.id, value);
    }

    $: canMoveUp = selectedIdx !== null && selectedIdx > 0;
    $: canMoveDown = selectedIdx !== null && selectedIdx >= 0 && selectedIdx < filters.length - 1;
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
                {#each filters as filter, idx (filter.id)}
                    <tr
                        class="row"
                        class:selected={filter.id === selected_id}
                        on:click={() => selectRow(filter.id)}
                    >
                        <td class="label-cell">{filter.label}</td>
                        <td class="checkbox-cell">
                            <TableCheckbox
                                checked={filter.applied}
                                onChange={(v) => handleAppliedChange(idx, v)}
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

    table, th, td {
        border: 1px solid black;
    }

    .table-wrapper {
        border: none;
        border-radius: 4px;
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
        padding: 5px 5px;
        color: #475467;
        border-bottom: 1px solid #eaecf0;
    }

    .row:last-child td {
        border-bottom: none;
    }

    .label-cell {
        text-align: left;
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
