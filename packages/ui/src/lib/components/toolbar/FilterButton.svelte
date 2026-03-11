<script lang="ts">
    import FilterTable from "../filter_modal/FilterTable.svelte";
    import Modal from "../reusable_components/Modal.svelte";

    let basicOpen = false;
</script>

<button on:click={() => (basicOpen = true)}> Edit Filters </button>
<Modal bind:open={basicOpen} title="Edit Filters" size="lg">
    <FilterTable/>
</Modal>

<style></style>
