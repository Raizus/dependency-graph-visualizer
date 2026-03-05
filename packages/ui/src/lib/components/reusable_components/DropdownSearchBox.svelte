<script lang="ts">
    export let searchQuery: string = "";
</script>

<div class="search-row">
    <svg class="search-icon" viewBox="0 0 20 20" fill="none">
        <circle cx="8.5" cy="8.5" r="5.5" stroke="#9ca3af" stroke-width="1.5" />
        <path
            d="M13 13l3.5 3.5"
            stroke="#9ca3af"
            stroke-width="1.5"
            stroke-linecap="round"
        />
    </svg>
    <!-- svelte-ignore a11y-autofocus -->
    <input
        class="search-input"
        type="text"
        bind:value={searchQuery}
        placeholder="Search..."
        autofocus
    />
</div>

<style>
    .search-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
    }

    .search-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }

    .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 14px;
        color: #111827;
        background: transparent;
        caret-color: #6366f1;
    }

    .search-input::placeholder {
        color: #9ca3af;
    }
</style>
