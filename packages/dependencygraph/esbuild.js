const esbuild = require("esbuild");
const sveltePlugin = require("esbuild-svelte");
const sveltePreprocess = require("svelte-preprocess");
const { sassPlugin } = require("esbuild-sass-plugin");

const path = require("path");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

// --- Bundle 1: Extension host (Node.js, CommonJS) ---
const extensionConfig = {
    entryPoints: ["src/extension.ts"],
    bundle: true,
    outfile: "dist/extension.js",
    external: ["vscode"], // Must be external — provided by VS Code at runtime
    format: "cjs",
    platform: "node",
    target: "node18",
    sourcemap: true,
};

// --- Bundle 2: Webview UI (browser, ESM, includes Svelte) ---
const webviewConfig = {
    entryPoints: ["src/webview/main.ts"],
    bundle: true,
    outfile: "dist/webview.js",
    format: "esm",
    platform: "browser",
    plugins: [
        sassPlugin(),
        sveltePlugin({
            preprocess: sveltePreprocess,
            compilerOptions: { css: "external" },
        }),
    ],
    sourcemap: true,
};

// /**
//  * @type {import('esbuild').Plugin}
//  */
// const esbuildProblemMatcherPlugin = {
//     name: "esbuild-problem-matcher",

//     setup(build) {
//         build.onStart(() => {
//             console.log("[watch] build started");
//         });
//         build.onEnd((result) => {
//             result.errors.forEach(({ text, location }) => {
//                 console.error(`✘ [ERROR] ${text}`);
//                 console.error(
//                     `    ${location.file}:${location.line}:${location.column}:`,
//                 );
//             });
//             console.log("[watch] build finished");
//         });
//     },
// };

// async function main() {
//     const ctx = await esbuild.context({
//         entryPoints: ["src/extension.ts"],
//         bundle: true,
//         format: "cjs",
//         minify: production,
//         sourcemap: !production,
//         sourcesContent: false,
//         platform: "node",
//         outfile: "dist/extension.js",
//         external: ["vscode"],
//         logLevel: "silent",
//         plugins: [
//             /* add to the end of plugins array */
//             esbuildProblemMatcherPlugin,
//         ],
//     });
//     if (watch) {
//         await ctx.watch();
//     } else {
//         await ctx.rebuild();
//         await ctx.dispose();
//     }
// }

// main().catch((e) => {
//     console.error(e);
//     process.exit(1);
// });

async function build() {
    if (watch) {
        const [extCtx, webCtx] = await Promise.all([
            esbuild.context(extensionConfig),
            esbuild.context(webviewConfig),
        ]);
        await Promise.all([extCtx.watch(), webCtx.watch()]);
        console.log("Watching...");
    } else {
        await Promise.all([
            esbuild.build(extensionConfig),
            esbuild.build(webviewConfig),
        ]);
        console.log("Build complete.");
    }
}

build().catch((e) => {
    console.error(e);
    process.exit(1);
});
