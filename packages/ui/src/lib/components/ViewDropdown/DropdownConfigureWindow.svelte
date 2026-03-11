<script lang="ts">
    import ViewMenu from "./ViewMenu.svelte";

    export let title: string = "Configure";
    export let back: () => void;
    export let close: () => void;
</script>

<div class="configure-window">
    <!-- Header -->
    <div class="header">
        <button class="header-btn back-btn" title="Back" on:click={back}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path
                    d="M12 15l-5-5 5-5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>

        <span class="header-title" {title}>{title}</span>

        <div class="header-actions">
            <!-- Vertical dots menu -->
            <slot name="menu"></slot>

            <!-- Close -->
            <button class="header-btn close-btn" title="Close" on:click={close}>
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                    <path
                        d="M5 5l10 10M15 5L5 15"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                    />
                </svg>
            </button>
        </div>
    </div>

    <hr class="divider" />

    <!-- Slot content -->
    <div class="content">
        <slot name="content" />
    </div>
</div>

<style>
    .configure-window {
        display: flex;
        flex-direction: column;
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        font-size: 14px;
        background: var(--bg-color-2);
    }

    /* Header */
    .header {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 8px 8px 4px;
        min-height: 44px;
    }

    .header-title {
        flex: 1;
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 4px;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
    }

    /* Header buttons */
    .header-btn {
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: none;
        border-radius: 6px;
        color: #6b7280;
        flex-shrink: 0;
    }

    .header-btn:hover {
        /* background: #f3f4f6; */
        color: #111827;
    }

    .back-btn:hover {
        /* background: #f3f4f6; */
        color: #6366f1;
    }

    .close-btn:hover {
        /* background: #fef2f2; */
        color: #ef4444;
    }

    /* Divider */
    .divider {
        margin: 0;
        border: none;
        border-top: 1px solid #f3f4f6;
    }

    /* Content slot */
    .content {
        flex: 1;
        overflow-y: auto;
    }
</style>
