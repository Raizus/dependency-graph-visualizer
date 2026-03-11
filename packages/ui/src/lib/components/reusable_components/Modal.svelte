<script lang="ts">
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    // ── Props ──────────────────────────────────────────────────────────────────
    export let open: boolean = false;
    export let title: string = "";
    export let size: "sm" | "md" | "lg" | "xl" | "full" = "md";
    export let closeOnBackdrop: boolean = true;
    export let closeOnEsc: boolean = true;
    export let showCloseButton: boolean = true;
    export let preventBodyScroll: boolean = true;

    // ── Lifecycle ──────────────────────────────────────────────────────────────
    function handleKeydown(e: KeyboardEvent) {
        if (closeOnEsc && e.key === "Escape" && open) close();
    }

    $: if (open && preventBodyScroll) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }

    onMount(() => window.addEventListener("keydown", handleKeydown));
    onDestroy(() => {
        window.removeEventListener("keydown", handleKeydown);
        document.body.style.overflow = "";
    });

    // ── Methods ────────────────────────────────────────────────────────────────
    function close() {
        open = false;
    }

    function handleBackdropClick() {
        if (closeOnBackdrop) close();
    }
</script>

<!-- ── Markup ─────────────────────────────────────────────────────────────── -->
{#if open}
    <!-- Backdrop -->
    <div
        class="modal-backdrop"
        role="presentation"
        on:click={handleBackdropClick}
        transition:fade={{ duration: 200 }}
    ></div>

    <!-- Dialog -->
    <div
        class="modal-wrapper"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
    >
        <div
            class="modal modal--{size}"
            transition:scale={{
                duration: 250,
                easing: quintOut,
                start: 0.94,
                opacity: 0,
            }}
        >
            <!-- Header -->
            {#if title || showCloseButton}
                <header class="modal__header">
                    {#if title}
                        <h2 id="modal-title" class="modal__title">{title}</h2>
                    {/if}
                    {#if showCloseButton}
                        <button
                            class="modal__close"
                            on:click={close}
                            aria-label="Close modal"
                        >
                            <svg
                                class="modal__close-icon"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M1 1L17 17M17 1L1 17"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </button>
                    {/if}
                </header>
            {/if}

            <!-- Body -->
            <div class="modal__body">
                <slot />
            </div>

            <!-- Footer -->
            {#if $$slots.footer}
                <footer class="modal__footer">
                    <slot name="footer" />
                </footer>
            {/if}
        </div>
    </div>
{/if}

<!-- ── Styles ─────────────────────────────────────────────────────────────── -->
<style>
    /* ── Design Tokens ─────────────────────────────────────────────────────── */
    :global(:root) {
        --modal-font-sans: "DM Sans", "Helvetica Neue", sans-serif;
        --modal-font-display: "DM Serif Display", Georgia, serif;
    }

    /* ── Backdrop ──────────────────────────────────────────────────────────── */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: var(--modal-backdrop);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: var(--modal-z);
    }

    /* ── Wrapper (centering container) ─────────────────────────────────────── */
    .modal-wrapper {
        position: fixed;
        inset: 0;
        z-index: calc(var(--modal-z) + 1);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        pointer-events: none;
    }

    /* ── Modal panel ────────────────────────────────────────────────────────── */
    .modal {
        pointer-events: all;
        background: var(--modal-bg);
        border-radius: var(--modal-radius);
        box-shadow: var(--modal-shadow);
        border: 1px solid var(--modal-border);
        display: flex;
        flex-direction: column;
        width: 100%;
        max-height: calc(100vh - 3rem);
        overflow: hidden;
        font-family: var(--modal-font-sans);
    }

    /* ── Size variants ──────────────────────────────────────────────────────── */
    .modal--sm {
        max-width: 380px;
    }
    .modal--md {
        max-width: 560px;
    }
    .modal--lg {
        max-width: 760px;
    }
    .modal--xl {
        max-width: 1020px;
    }
    .modal--full {
        max-width: calc(100vw - 3rem);
        max-height: calc(100vh - 3rem);
    }

    /* ── Header ─────────────────────────────────────────────────────────────── */
    .modal__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        background: var(--modal-header-bg);
        border-bottom: 1px solid var(--modal-header-border);
        flex-shrink: 0;
    }

    .modal__title {
        margin: 0;
        font-family: var(--modal-font-display);
        font-size: 1.25rem;
        font-weight: 400;
        color: var(--modal-title-color);
        letter-spacing: -0.01em;
        line-height: 1.3;
    }

    /* ── Close button ───────────────────────────────────────────────────────── */
    .modal__close {
        flex-shrink: 0;
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        /* background: var(--modal-close-bg);
        color: var(--modal-close-color); */
    }

    .modal__close-icon {
        display: block;
        width: 18px;
        height: 18px;
        min-width: 18px;
        min-height: 18px;
        flex-shrink: 0;
        overflow: visible;
    }

    /* .modal__close:hover {
        background: var(--modal-close-hover-bg);
        color: var(--modal-close-hover-color);
    } */

    .modal__close:focus-visible {
        outline: 2px solid #4f6ef7;
        outline-offset: 2px;
    }

    /* ── Body ───────────────────────────────────────────────────────────────── */
    .modal__body {
        padding: 1.75rem 1.5rem;
        overflow-y: auto;
        flex: 1;
        color: var(--modal-body-color);
        font-size: 0.9375rem;
        line-height: 1.65;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
    }

    .modal__body::-webkit-scrollbar {
        width: 5px;
    }

    .modal__body::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.15);
        border-radius: 99px;
    }

    /* ── Footer ─────────────────────────────────────────────────────────────── */
    .modal__footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.625rem;
        padding: 1rem 1.5rem;
        background: var(--modal-footer-bg);
        border-top: 1px solid var(--modal-footer-border);
        flex-shrink: 0;
    }

    /* ── Responsive ─────────────────────────────────────────────────────────── */
    @media (max-width: 480px) {
        .modal-wrapper {
            padding: 0;
            align-items: flex-end;
        }

        .modal {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            max-height: 90vh;
            max-width: 100%;
        }
    }
</style>
