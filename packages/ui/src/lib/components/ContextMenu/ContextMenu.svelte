<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { type MenuAction, type MenuItem } from "./ContextMenu";
    import { type NodeMenuContextI } from "./GraphCanvasContextMenu";

    type AnyContext = any;
    
    // export let context: ContextMenuContextI;
    export let items: MenuItem<AnyContext>[];
    export let context: AnyContext;

    // When true, this instance is a submenu: no global listeners, positioned absolutely
    export let isSubmenu: boolean = false;

    let visible = isSubmenu; // submenus are always "visible" — parent controls mounting
    let x = 0;
    let y = 0;
    let menuEl: HTMLElement;
    let submenuOpenId: string | null = null;
    let submenuTimeout: ReturnType<typeof setTimeout>;

    function open(event: MouseEvent) {
        event.preventDefault();
        submenuOpenId = null;
        visible = true;
        x = event.clientX;
        y = event.clientY;
    }

    function close() {
        visible = false;
        submenuOpenId = null;

        // capture click outside that closes the menus, so it does not interact with canvas
    }

    function handleItemClick(item: MenuAction<AnyContext>) {
        if (item.disabled) return;
        item.action(context);
        // Bubble a close event up so the root menu closes too
        menuEl?.dispatchEvent(new CustomEvent("menuclose", { bubbles: true }));
    }

    function openSubmenu(id: string) {
        clearTimeout(submenuTimeout);
        submenuOpenId = id;
    }

    function scheduleCloseSubmenu() {
        submenuTimeout = setTimeout(() => {
            submenuOpenId = null;
        }, 200);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") close();
    }

    // Clamp root menu to viewport after it becomes visible
    $: if (!isSubmenu && visible && menuEl) {
        const rect = menuEl.getBoundingClientRect();
        if (x + rect.width > window.innerWidth)
            x = window.innerWidth - rect.width - 8;
        if (y + rect.height > window.innerHeight)
            y = window.innerHeight - rect.height - 8;
    }

    onMount(() => {
        if (isSubmenu) return;
        window.addEventListener("contextmenu", open);
        window.addEventListener("click", close);
        window.addEventListener("keydown", handleKeydown);
        window.addEventListener("scroll", close, { passive: true });
        // Close when a nested submenu item fires the bubble event
        window.addEventListener("menuclose", close);
    });

    onDestroy(() => {
        if (isSubmenu) return;
        window.removeEventListener("contextmenu", open);
        window.removeEventListener("click", close);
        window.removeEventListener("keydown", handleKeydown);
        window.removeEventListener("scroll", close);
        window.removeEventListener("menuclose", close);
    });
</script>

{#if visible}
    <div
        class="menu"
        class:submenu={isSubmenu}
        bind:this={menuEl}
        style={!isSubmenu ? `left: ${x}px; top: ${y}px;` : ""}
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="menu"
        tabindex="-1"
        aria-label="Context menu"
    >
        {#each items as item (item.id)}
            {#if item.type === "separator"}
                <div class="separator" role="separator"></div>
            {:else if item.type === "group"}
                <div
                    class="group-wrapper"
                    on:mouseenter={() => openSubmenu(item.id)}
                    on:mouseleave={scheduleCloseSubmenu}
                    role="none"
                >
                    <button
                        class="item group-item"
                        class:open={submenuOpenId === item.id}
                        class:disabled={item.disabled}
                        on:keydown={(e) =>
                            e.key === "Enter" && openSubmenu(item.id)}
                        role="menuitem"
                        aria-haspopup="true"
                        aria-expanded={submenuOpenId === item.id}
                        tabindex={item.disabled ? -1 : 0}
                        aria-disabled={item.disabled}
                        disabled={item.disabled}
                        type="button"
                    >
                        {#if item.icon}<span class="icon">{item.icon}</span
                            >{/if}
                        <span class="label">{item.label}</span>
                        <span class="chevron">›</span>
                    </button>

                    {#if submenuOpenId === item.id && !item.disabled}
                        <svelte:self
                            items={item.children}
                            isSubmenu={true}
                            {context}
                        />
                    {/if}
                </div>
            {:else}
                <button
                    class="item"
                    class:disabled={item.disabled}
                    on:click={() => handleItemClick(item)}
                    role="menuitem"
                    tabindex={item.disabled ? -1 : 0}
                    aria-disabled={item.disabled}
                    disabled={item.disabled}
                    type="button"
                >
                    {#if item.icon}<span class="icon">{item.icon}</span>{/if}
                    <span class="label">{item.label}</span>
                    {#if item.shortcut}<span class="shortcut"
                            >{item.shortcut}</span
                        >{/if}
                </button>
            {/if}
        {/each}
    </div>
{/if}

<style>
    .menu {
        position: fixed;
        z-index: 9999;
        min-width: 200px;
        padding: 6px;
        background: #18181b;
        border: 1px solid #2e2e33;
        border-radius: 10px;
        box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.4),
            0 12px 32px -4px rgba(0, 0, 0, 0.6),
            0 0 0 0.5px rgba(255, 255, 255, 0.04) inset;
        animation: menu-in 120ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform-origin: top left;
        font-family: "SF Pro Text", "Segoe UI", system-ui, sans-serif;
        font-size: 13px;
        color: #e4e4e7;
        user-select: none;
    }

    /* Submenu instances are positioned absolutely inside their group-wrapper */
    .menu.submenu {
        position: absolute;
        left: calc(100% + 6px);
        top: -6px;
        min-width: 180px;
        z-index: 10000;
        animation-duration: 100ms;
    }

    @keyframes menu-in {
        from {
            opacity: 0;
            transform: scale(0.94) translateY(-4px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    button.item {
        appearance: none;
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        font: inherit;
        color: inherit;
    }

    .item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 10px;
        border-radius: 6px;
        cursor: default;
        transition:
            background 80ms ease,
            color 80ms ease;
        position: relative;
        letter-spacing: 0.01em;
        outline: none;
    }

    .item:hover:not(.disabled),
    .item:focus-visible:not(.disabled),
    .group-item.open {
        background: #2563eb;
        color: #fff;
    }

    .item:hover:not(.disabled) .shortcut,
    .item:focus-visible:not(.disabled) .shortcut,
    .item:hover:not(.disabled) .chevron,
    .group-item.open .chevron {
        color: rgba(255, 255, 255, 0.65);
    }

    .item.disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }

    .icon {
        width: 16px;
        text-align: center;
        font-size: 14px;
        flex-shrink: 0;
        color: #a1a1aa;
        line-height: 1;
    }

    .item:hover:not(.disabled) .icon,
    .item:focus-visible:not(.disabled) .icon,
    .group-item.open .icon {
        color: rgba(255, 255, 255, 0.85);
    }

    .label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .shortcut {
        font-size: 11px;
        color: #52525b;
        letter-spacing: 0.04em;
        margin-left: auto;
        padding-left: 16px;
        transition: color 80ms ease;
    }

    .chevron {
        font-size: 16px;
        line-height: 1;
        color: #52525b;
        margin-left: auto;
        padding-left: 12px;
        transition: color 80ms ease;
    }

    .separator {
        height: 1px;
        background: #27272a;
        margin: 5px 4px;
    }

    .group-wrapper {
        position: relative;
    }
</style>
