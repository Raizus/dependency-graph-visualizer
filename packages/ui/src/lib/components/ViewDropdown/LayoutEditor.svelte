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
    $: view = views.get(item.value);
    $: selected_layout_type = layout_options.find(
        (option) => option.value === view?.layout.type,
    );

    function onChange(selected_option: DropdownItem): void {
        const layout = view?.layout;
        if (!layout) return;

        const layoutType = selected_option.value as "dot" | "fdp";
        if (!["dot", "fdp"].includes(layoutType)) return;
        layout.type = layoutType;
        state_store.setViewLayout(item.value, layout);
    }
</script>

<div class="editor-group">
    {#if selected_layout_type}
        <h3 class="layout">Layout</h3>
        <SimpleDropdown
            selected={selected_layout_type}
            placeholder="Select layout..."
            options={layout_options}
            {onChange}
        ></SimpleDropdown>
    {/if}
</div>

<style>
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
