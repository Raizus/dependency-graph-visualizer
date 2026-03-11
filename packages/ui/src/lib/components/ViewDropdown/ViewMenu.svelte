<script lang="ts">
    import { getContext } from "svelte";
    import ConfigButton from "../reusable_components/ConfigButton.svelte";
    import { StateStore } from "../../StateStore";

    export let view_id: string;
    const state_store = getContext<StateStore>("state_store");

    function delete_view_action() {
        state_store.deleteView(view_id);
    }

    function duplicate_view_action() {
        state_store.duplicateView(view_id);
    }

    const menu_items: Record<string, () => void> = {
        Delete: delete_view_action,
        Duplicate: duplicate_view_action,
    };
</script>

<ConfigButton {menu_items}></ConfigButton>
