<script lang="ts">
    export let clickCb: () => void;
</script>

<div class="add-row">
    <button class="add-btn" on:click={clickCb}>
        <svg class="add-icon" viewBox="0 0 20 20" fill="none">
            <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
            />
        </svg>
        <slot></slot>
    </button>
</div>

<style lang="scss">
    .add-row {
        padding: 4px 8px 6px;
    }

    .add-btn {
        gap: 7px;
        width: 100%;
        padding: 9px 10px;
        background: none;
        font-size: 14px;
        color: var(--font-color-1);
        font-weight: 500;
        border-radius: 6px;
    }

    .add-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }
</style>
