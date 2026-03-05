<script lang="ts">
    import Modal from "../reusable_components/Modal.svelte";
    import SaveModal from "./SaveModal.svelte";

    let basicOpen = false;
</script>

<button on:click={() => (basicOpen = true)}> Save </button>
<Modal bind:open={basicOpen} title="Export" size="md">
    <SaveModal/>
</Modal>

