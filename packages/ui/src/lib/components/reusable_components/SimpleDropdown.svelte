<script lang="ts">
    import type { DropdownItem } from "./dropdown";

    export let options: DropdownItem[] = [];
    export let placeholder: string = "";
    export let selected: DropdownItem | null = null;
    export let onChange: ((option: DropdownItem) => void) | null = null;

    function portal(node: HTMLElement) {
        document.body.appendChild(node);
        return {
            destroy() {
                node.remove();
            },
        };
    }

    let isOpen: boolean = false;
    let dropdownRef: HTMLDivElement;
    let menuRect: { top: number; left: number; width: number } | null = null;

    function getMenuPosition(): { top: number; left: number; width: number } {
        const rect = dropdownRef.getBoundingClientRect();
        return {
            top: rect.bottom + window.scrollY + 6,
            left: rect.left + window.scrollX,
            width: rect.width,
        };
    }

    function toggle(): void {
        isOpen = !isOpen;
        if (isOpen) menuRect = getMenuPosition();
    }

    function select(option: DropdownItem): void {
        selected = option;
        isOpen = false;
        onChange?.(option);
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape") isOpen = false;
    }

    function handleOutsideClick(event: MouseEvent): void {
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
            isOpen = false;
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} on:click={handleOutsideClick} />

<div class="dropdown" bind:this={dropdownRef}>
    <button
        id="dropdown-trigger"
        class="trigger"
        class:open={isOpen}
        class:has-focus={isOpen}
        on:click|stopPropagation={toggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
    >
        <span class="trigger-text" class:placeholder={!selected}>
            {selected ? selected.label : placeholder}
        </span>
        <span class="chevron" class:rotated={isOpen}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                    d="M2 4L6 8L10 4"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </span>
    </button>

    {#if isOpen && menuRect}
        <ul
            class="menu"
            role="listbox"
            style="top: {menuRect.top}px; left: {menuRect.left}px; width: {menuRect.width}px;"
            use:portal
        >
            {#each options as option}
                <li
                    class="option"
                    class:active={selected?.value === option.value}
                    role="option"
                    aria-selected={selected?.value === option.value}
                    on:click|stopPropagation={() => select(option)}
                    on:keydown={(e) => e.key === "Enter" && select(option)}
                    tabindex="0"
                >
                    <span class="option-label">{option.label}</span>
                    {#if selected?.value === option.value}
                        <svg
                            class="check"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                        >
                            <path
                                d="M2 6L5 9L10 3"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style lang="scss">
    /* ── Dropdown container ───────────────────────────── */
    .dropdown {
        position: relative;
        width: 100%;
    }

    /* ── Trigger button ───────────────────────────────── */
    .trigger {
        justify-content: space-between;
        width: 100%;
        padding: 11px 14px;
        box-sizing: border-box;

        &:focus-visible {
            outline: none;
            border-color: #8a7560;
            box-shadow: 0 0 0 3px rgba(138, 117, 96, 0.18);
        }

        &.has-focus {
            box-shadow:
                0 0 0 3px rgba(96, 106, 138, 0.3),
                0 2px 8px rgba(60, 48, 36, 0.15);
        }

        &.open {
            border-color: #8a7560;
        }
    }


    /* ── Trigger text ─────────────────────────────────── */
    .trigger-text {
        font-size: 14.5px;
        letter-spacing: 0.01em;

        &.placeholder {
            color: #b0a898;
            font-style: italic;
        }
    }

    /* ── Chevron icon ─────────────────────────────────── */
    .chevron {
        display: flex;
        align-items: center;
        color: #a09880;
        transition: transform 0.2s ease;
        flex-shrink: 0;
    }

    .chevron.rotated {
        transform: rotate(180deg);
    }

    /* ── Dropdown menu ────────────────────────────────── */
    .menu {
        position: absolute;
        list-style: none;
        margin: 0;
        padding: 4px 0;
        background-color: var(--button-bg-color, #fff);
        border: 1.5px solid #8a7560;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(60, 48, 36, 0.12);
        z-index: 9999;
        animation: menuOpen 0.12s ease;
    }

    @keyframes menuOpen {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* ── Option items ─────────────────────────────────── */
    .menu .option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 14px;
        cursor: pointer;
        transition: background-color 0.1s ease;

        &:hover {
            background-color: var(--option-hover-color);
        }

        &:focus-visible {
            outline: none;
            background-color: var(--option-hover-color);
        }

        &:active {
            background-color: var(--option-hover-color);
        }

        &.active .option-label {
            font-weight: 600;
            color: var(--border-highlight-color);
        }
    }

    .menu .option-label {
        font-size: 14.5px;
        letter-spacing: 0.01em;
    }

    /* ── Check icon ───────────────────────────────────── */
    .menu .check {
        color: #8a7560;
        flex-shrink: 0;
    }
</style>
