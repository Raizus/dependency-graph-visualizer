<script lang="ts">
    import FilterButton from "./FilterButton.svelte";
    import LoadButton from "./LoadButton.svelte";
    import SaveButton from "./SaveButton.svelte";
    import SearchNavigator from "./SearchNavigator.svelte";
    import ViewDropdown from "../ViewDropdown/ViewDropdown.svelte";
</script>

<div id="toolbar">
    <LoadButton />
    <SaveButton />
    <FilterButton />
    <ViewDropdown />
    <SearchNavigator />
</div>

<style>
    #toolbar {
        background-color: var(--bg-color-2);
        position: absolute;
        top: 1rem;
        left: 1rem;
        max-height: 3.5rem;
        display: flex;
        flex-direction: row;
        padding: 0.5rem;
        border-radius: 0.5rem;
        gap: 0.5rem;
    }
</style>
