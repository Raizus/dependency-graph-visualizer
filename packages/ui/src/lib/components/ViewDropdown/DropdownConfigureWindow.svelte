<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let title: string = "Configure";
    export let menuOptions: string[] = ["Rename", "Duplicate", "Delete"];

    const dispatch = createEventDispatcher<{
        back: void;
        close: void;
        menuSelect: string;
    }>();

    let menuOpen: boolean = false;

    function back(): void {
        dispatch("back");
    }

    function close(): void {
        dispatch("close");
    }

    function toggleMenu(): void {
        menuOpen = !menuOpen;
    }

    function selectOption(option: string): void {
        dispatch("menuSelect", option);
        menuOpen = false;
    }
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
            <div class="menu-wrapper">
                <button
                    class="header-btn dots-btn"
                    title="Options"
                    on:click={toggleMenu}
                >
                    <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        width="16"
                        height="16"
                    >
                        <circle cx="10" cy="4" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="10" cy="16" r="1.5" />
                    </svg>
                </button>

                {#if menuOpen}
                    <div
                        class="menu-backdrop"
                        role="none"
                        on:click={() => (menuOpen = false)}
                        on:keydown={() => {}}
                    ></div>
                    <ul class="menu-dropdown" role="menu">
                        {#each menuOptions as option}
                            <li role="none">
                                <button
                                    class="menu-option"
                                    class:menu-option--danger={option.toLowerCase() ===
                                        "delete"}
                                    role="menuitem"
                                    on:click={() => selectOption(option)}
                                >
                                    {option}
                                </button>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>

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
        <slot />
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
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: none;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        color: #6b7280;
        transition:
            background 0.1s ease,
            color 0.1s ease;
        flex-shrink: 0;
    }

    .header-btn:hover {
        background: #f3f4f6;
        color: #111827;
    }

    .back-btn:hover {
        background: #f3f4f6;
        color: #6366f1;
    }

    .close-btn:hover {
        background: #fef2f2;
        color: #ef4444;
    }

    /* Dots menu */
    .menu-wrapper {
        position: relative;
    }

    .menu-backdrop {
        position: fixed;
        inset: 0;
        z-index: 10;
    }

    .menu-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        right: 0;
        z-index: 11;
        list-style: none;
        margin: 0;
        padding: 4px 0;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        min-width: 140px;
    }

    .menu-option {
        display: block;
        width: 100%;
        padding: 8px 14px;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        font-size: 14px;
        color: #374151;
        transition: background 0.1s ease;
    }

    .menu-option:hover {
        background: #f9fafb;
    }

    .menu-option--danger {
        color: #ef4444;
    }

    .menu-option--danger:hover {
        background: #fef2f2;
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
