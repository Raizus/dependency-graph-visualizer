<script lang="ts">
    import { getContext } from "svelte";
    import SimpleDropdown from "../reusable_components/SimpleDropdown.svelte";
    import { StateStore } from "../../StateStore";
    import type { DropdownItem } from "../reusable_components/dropdown";

    export let item: DropdownItem;

    const layout_options = [
        { value: "dot", label: "Hierarquical Layout" },
        { value: "fdp", label: "Force-Directed Placement" },
    ];

    const state_store = getContext<StateStore>("state_store");
    const views_store = state_store.views;

    $: views = $views_store;
    $: view_name = item.value;
    $: view = views.get(view_name);
    $: selected_layout_type = layout_options.find(
        (option) => option.value === view?.layout.type,
    );

    let text_str: string = item.value;

    function onInputChange(e: Event) {
        const new_name = (e.target as HTMLInputElement).value;
        const success = state_store.renameView(item.value, new_name);
        if (success) view_name = new_name;
    }

    function dropdownChangeCb(selected_option: DropdownItem): void {
        const layout = view?.layout;
        if (!layout) return;

        const layoutType = selected_option.value as "dot" | "fdp";
        if (!["dot", "fdp"].includes(layoutType)) return;
        layout.type = layoutType;
        state_store.setViewLayout(item.value, layout);
    }
</script>

<div class="editor-group">
    <div class="input-container">
        <input bind:value={text_str} on:change={onInputChange} />
    </div>
    {#if selected_layout_type}
        <h3 class="layout">Layout</h3>
        <SimpleDropdown
            selected={selected_layout_type}
            placeholder="Select layout..."
            options={layout_options}
            onChange={dropdownChangeCb}
        ></SimpleDropdown>
    {/if}
</div>

<style lang="scss">
    .input-container {
        display: flex;
    }

    input {
        padding-left: 5px;
        height: 32px;
        border: 1px solid rgb(47, 47, 47);
        background-color: var(--button-bg-color);
        border-radius: 6px;
        box-shadow: none;
        flex-grow: 1;

        &:focus-within {
            outline: none;
            border-color: var(--border-highlight-color);
        }
    }

    .layout {
        color: var(--font-color-1);
        text-align: left;
    }

    .editor-group {
        display: flex;
        flex-direction: column;
        margin: 0.6rem;
    }
</style>
