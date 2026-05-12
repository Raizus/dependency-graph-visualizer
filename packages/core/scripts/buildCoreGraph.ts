import { writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ParserSettings } from "#parsers/ParserPlugin.ts";
import { graphToJSON } from "#models/Graph.ts";
import { TypescriptParser } from "#parsers/TypescriptParser.ts";
import { buildGraph } from "#parsers/buildGraph.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const root = resolve(__dirname, "../../core/src"); // adjust if needed
const tsConfigPath = resolve(__dirname, "../../core/tsconfig.json");
const outputPath = resolve(__dirname, "core-graph.json");

const settings: ParserSettings = {
    ignore_path: ["node_modules", "dist", "scripts"],
    include_folder_nodes: true,
    include_file_nodes: true,
    include_external_nodes: false,
    exclude_external: [],
};

const tsParser = new TypescriptParser();
tsParser.initProject(root, existsSync(tsConfigPath) ? tsConfigPath : undefined);

console.log(`Parsing ${root}...`);
const graph = buildGraph(root, [tsParser], settings);

console.log(`Graph built: ${graph.order} nodes, ${graph.size} edges`);

const out_json = {
    graph: graphToJSON(graph),
};

writeFileSync(outputPath, JSON.stringify(out_json, null, 2), "utf8");
console.log(`Saved to ${outputPath}`);
