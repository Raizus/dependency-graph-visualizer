import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@core": resolve(__dirname, "./src"),
            "@parsers": resolve(__dirname, "./src/parsers"),
        },
    },
    test: {
        globals: true,
        environment: "node",
    },
});
