<!-- TableCheckbox.svelte -->
<script lang="ts">
  export let checked: boolean = false;
  export let onChange: (value: boolean) => void = () => {};
</script>

<input
  type="checkbox"
  {checked}
  on:change={(e) => onChange((e.target as HTMLInputElement).checked)}
  on:click|stopPropagation
/>

<style>
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #4f46e5;
    cursor: pointer;
  }
</style>