<script lang="ts">
    export let menu_items: Record<string, () => void>;

    let menuOpen: boolean = false;

    function toggleMenu(): void {
        menuOpen = !menuOpen;
    }

    function selectOption(): void {
        menuOpen = false;
    }
</script>

<div class="menu-wrapper">
    <button class="header-btn dots-btn" title="Options" on:click={toggleMenu}>
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
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
            {#each Object.entries(menu_items) as [key, func]}
                <li role="none">
                    <button
                        class="menu-option"
                        class:menu-option--danger={key.toLowerCase() ===
                            "delete"}
                        role="menuitem"
                        on:click={() => {
                            selectOption();
                            func();
                        }}
                    >
                        {key}
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
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
        color: var(--border-highlight-color);
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
        background: var(--bg-color-2);
        border: 1px solid #2a2a2a;
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
        color: var(--font-color-1);
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
</style>
