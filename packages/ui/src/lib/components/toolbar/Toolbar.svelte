<script lang="ts">
    import DropdownMenu from "../reusable_components/DropdownMenu.svelte";
    import FilterButton from "./FilterButton.svelte";
    import LoadButton from "./LoadButton.svelte";
    import SaveButton from "./SaveButton.svelte";
    import SearchNavigator from "./SearchNavigator.svelte";
</script>

<div id="toolbar">
    <LoadButton />
    <SaveButton />
    <FilterButton />
    <DropdownMenu
        items={[
            { id: "option1", label: "Option 1" },
            { id: "option2", label: "Option 2" },
            { id: "option3", label: "Option 3" },
        ]}
        placeholder="Select an option..."
    />
    <SearchNavigator />
    <!-- dropdown menu: list of choices, plus a button at the bottom to create a new choice -->
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
