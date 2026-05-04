<script lang="ts">
    import ClustersEditor from "../clusters_modal/ClustersEditor.svelte";
    import Modal from "../reusable_components/Modal.svelte";

    let basicOpen = false;
</script>

<button on:click={() => (basicOpen = true)}> Edit Clusters </button>
<Modal bind:open={basicOpen} title="Edit Clusters" size="lg">
    <ClustersEditor />
</Modal>

<style></style>
