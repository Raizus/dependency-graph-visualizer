<script lang="ts">
    import { getContext } from "svelte";
    import type { StateStore } from "../../StateStore";
    import { newBlanckView, ViewMap } from "@dep-graph-vis/core";
    import DropdownMenu from "./DropdownMenu.svelte";
    import type { DropdownItem } from "../reusable_components/dropdown";

    const state_store = getContext<StateStore>("state_store");
    const views_store = state_store.views;
    const current_view_label_store = state_store.current_view_label;

    $: views = $views_store;
    $: selected = $current_view_label_store;

    function addNewView() {
        const new_view = newBlanckView("View");
        state_store.addView(new_view);
    }

    function selectView(label: string) {
        state_store.setCurrentViewLabel(label);
    }

    function buildItems(views: ViewMap) {
        const items: DropdownItem[] = [];
        for (const label of views.keys()) {
            items.push({ value: label, label });
        }
        console.log("buildItems: ", items);
        return items;
    }
</script>

<DropdownMenu
    items={buildItems(views)}
    title="Select or create new view"
    {selected}
    placeholder="Select or create view..."
    addNewCallback={addNewView}
    selectCallback={selectView}
></DropdownMenu>

<style>
</style>
