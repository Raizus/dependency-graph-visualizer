import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    plugins: [svelte()],
    build: {
        lib: {
            entry: {
                App: "./src/App.svelte",
                GraphCanvas: "./src/lib/GraphCanvas.svelte",
            },
            formats: ["es"],
        },
        rollupOptions: {
            external: [
                "svelte",
                "@dependency-graph/core",
                "graphology",
                "vis-network",
            ],
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
    },
});