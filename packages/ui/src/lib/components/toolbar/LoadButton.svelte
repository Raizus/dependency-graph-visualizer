<script lang="ts">
    import { getContext } from "svelte";
    import { loadStateJson, StateStore } from "../../StateStore";
    import type { StateJSON } from "@dep-graph-vis/core";

    let inputRef: HTMLInputElement | null = null;
    let files: FileList | null = null;

    const state_store = getContext<StateStore>("state_store");

    $: if (files && files.length) {
        const file = files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(file);

        fileReader.onload = function (evt) {
            if (!evt.target) alert(fileReader.error);

            // read file successfully
            if (evt.target && evt.target.result) {
                const result = evt.target.result;
                if (typeof result !== "string") return;
                const obj = JSON.parse(result);

                // TODO: validate json
                
                // state from json
                const { graph, views } = loadStateJson(obj as StateJSON);
                state_store.setState(graph, views);
            }
        };

        fileReader.onerror = function () {
            alert(fileReader.error);
        };
    }
</script>

<button on:click={() => inputRef?.click()}>
    Load
    <input bind:this={inputRef} type="file" accept=".json" bind:files />
</button>

<style>
	input {
		position: relative;
		display: none;
		appearance: none;
		opacity: 0;
		top: 0;
		left: 0;
	}
</style>
