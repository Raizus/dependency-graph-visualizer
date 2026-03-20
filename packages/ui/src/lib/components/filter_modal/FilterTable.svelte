<script lang="ts">
    import TableCheckbox from "./TableCheckbox..svelte";
    import { getContext, onDestroy, onMount } from "svelte";
    import type { StateStore } from "../../StateStore";

    const state_store = getContext<StateStore>("state_store");
    let { current_view: current_view_store } = state_store;
    $: filters = $current_view_store.filters;

    let selected_id: string | null = null;
    let selectedIdx: number | null = null;

    // function getSelectedIdx(selected_id: string | null) {
    //     if (!selected_id) return null;
    //     const idx = filters.findIndex(filter => filter.id === selected_id);
    //     return idx;
    // }

    function selectRow(idx: number) {
        selectedIdx = idx;
        // selected_id = filter_id;
        // selectedIdx = getSelectedIdx(selected_id);
    }

    // Placeholder global state functions
    function onReorder() {
        // selectedIdx = getSelectedIdx(selected_id);
    }

    function onToggleApplied(idx: number, value: boolean) {
        state_store.filterSetApplied(idx, value);
    }

    function onToggleShow(idx: number, value: boolean) {
        state_store.filterSetShow(idx, value);
    }

    function moveUp() {
        if (selectedIdx === null) return
        state_store.filterMoveUp(selectedIdx);
        selectedIdx = selectedIdx - 1;
        // onReorder();
    }

    function moveDown() {
        if (selectedIdx === null) return
        state_store.filterMoveDown(selectedIdx);
        selectedIdx = selectedIdx + 1;
        // onReorder();
    }

    function handleAppliedChange(idx: number, value: boolean) {
        onToggleApplied(idx, value);
    }

    function deleteFilter() {
        if (selectedIdx === null) return;
        state_store.deleteFilter(selectedIdx);        
    }

    function handleKeydown(event: KeyboardEvent) {
        if(event.key !== "Delete") return;
        deleteFilter();
    } 

    function handleShowChange(idx: number, value: boolean) {
        onToggleShow(idx, value);
    }

    $: canMoveUp = selectedIdx !== null && selectedIdx > 0;
    $: canMoveDown = selectedIdx !== null && selectedIdx >= 0 && selectedIdx < filters.length - 1;

    onMount(() => window.addEventListener("keydown", handleKeydown));
    onDestroy(() => {
        window.removeEventListener("keydown", handleKeydown);
    });
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
                {#each filters as filter, idx}
                    <tr
                        class="row"
                        class:selected={idx === selectedIdx}
                        on:click={() => selectRow(idx)}
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
                                onChange={(v) => handleShowChange(idx, v)}
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
        <button
            class="order-btn"
            on:click={deleteFilter}
            disabled={selectedIdx === null}
            title="Delete"
        >
            Delete
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
        flex-grow: 1;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        background-color: var(--bg-color-2);
        display: flex;
        flex-direction: column;
    }

    thead {
        display: block;
        width: 100%;
    }

    tbody {
        display: block;
        height: 240px;
        overflow-y: auto;
        width: 100%;
    }

    thead tr,
    tbody tr {
        display: table;
        width: 100%;
        table-layout: fixed;
    }

    thead tr {
        background-color: var(--bg-color-1);
    }

    th {
        padding: 10px 14px;
        text-align: left;
        font-weight: 600;
        user-select: none;

        &:not(:first-child) {
            text-align: center;
        }
    }

    .row {
        cursor: pointer;
        transition: background-color 0.12s ease;
        border-bottom: 1px solid black;
        
        &:hover {
            background-color: #a6a6a6;
        }

        &.selected {
            background-color: #767676;
        }

        &.selected td {
            color: #a8aafd;
        }
    }

    td {
        padding: 5px 5px;
    }

    /* .row:last-child td {
        border-bottom: none;
    } */

    .label-cell {
        text-align: left;
        white-space: nowrap;
    }

    .checkbox-cell {
        text-align: center;
    }

    .button-panel {
        align-self: center;
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