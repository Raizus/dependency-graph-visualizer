/// <reference types="node" />

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { type ParserSettings, TypescriptParser } from "./../../src/parsers";

// ── Helpers ──────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(__dirname, "fixtures");

const defaultSettings: ParserSettings = {
    ignore_path: [],
    include_folder_nodes: false,
    include_file_nodes: true,
    include_external_nodes: false,
    exclude_external: [],
};

function fixtureParser(fixtureName: string): {
    parser: TypescriptParser;
    root: string;
    parse: (
        file: string,
        settings?: Partial<ParserSettings>,
    ) => ReturnType<TypescriptParser["parseFile"]>;
} {
    const root = resolve(FIXTURES, fixtureName);
    const parser = new TypescriptParser();
    parser.initProject(root);

    const parse = (file: string, settings: Partial<ParserSettings> = {}) => {
        const filePath = resolve(root, file);
        const content = readFileSync(filePath, "utf8");
        return parser.parseFile(filePath, content, {
            ...defaultSettings,
            ...settings,
        });
    };

    return { parser, root, parse };
}

/** Checks whether an edge exists in a result */
function hasEdge(
    result: ReturnType<TypescriptParser["parseFile"]>,
    source: string,
    target: string,
    type?: string,
) {
    return result.edges.some(
        (e) =>
            e.source === source &&
            e.target === target &&
            (type === undefined || e.type === type),
    );
}

/** Checks whether a node exists in a result */
function hasNode(
    result: ReturnType<TypescriptParser["parseFile"]>,
    key: string,
) {
    return result.nodes.some((n) => n.key === key);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TypeScriptParser — node declarations", () => {
    it("emits a function node for a function declaration", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("b.ts");

        expect(hasNode(result, "b.ts##funcB")).toBe(true);
        expect(result.nodes.find((n) => n.key === "b.ts##funcB")).toMatchObject(
            {
                label: "funcB",
                type: "function",
            },
        );
    });

    it("emits a class node for a class declaration", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("b.ts");

        expect(hasNode(result, "b.ts##ClassB")).toBe(true);
        expect(
            result.nodes.find((n) => n.key === "b.ts##ClassB"),
        ).toMatchObject({
            label: "ClassB",
            type: "class",
        });
    });

    it("emits a function node for an arrow function const", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("a.ts");

        expect(hasNode(result, "a.ts##arrowA")).toBe(true);
    });

    it("emits contains edges from file to declared symbols", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("b.ts");

        expect(hasEdge(result, "b.ts", "b.ts##funcB", "contains")).toBe(true);
        expect(hasEdge(result, "b.ts", "b.ts##ClassB", "contains")).toBe(true);
    });
});

describe("TypeScriptParser — import edges", () => {
    it("emits a file→file imports edge", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("a.ts");

        expect(hasEdge(result, "a.ts", "b.ts", "imports")).toBe(true);
    });

    it("does NOT emit a direct file→symbol edge for named imports", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("a.ts");

        // Only calls/instantiates edges should connect a.ts to b.ts symbols
        expect(hasEdge(result, "a.ts", "b.ts##funcB", "imports")).toBe(false);
        expect(hasEdge(result, "a.ts", "b.ts##ClassB", "imports")).toBe(false);
    });
});

describe("TypeScriptParser — call edges", () => {
    it("emits a calls edge from funcA to funcB across files", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("a.ts");

        expect(hasEdge(result, "a.ts##funcA", "b.ts##funcB", "calls")).toBe(
            true,
        );
    });

    it("emits an instantiates edge from funcA to ClassB", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("a.ts");

        expect(
            hasEdge(result, "a.ts##funcA", "b.ts##ClassB", "instantiates"),
        ).toBe(true);
    });

    it("emits a calls edge from arrowA to funcB", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("a.ts");

        expect(hasEdge(result, "a.ts##arrowA", "b.ts##funcB", "calls")).toBe(
            true,
        );
    });

    it("emits a calls edge inside a class method to a sibling function", () => {
        const { parse } = fixtureParser("simple");
        const result = parse("b.ts");

        // ClassB.method() calls funcB — both in same file
        expect(hasEdge(result, "b.ts##ClassB", "b.ts##funcB", "calls")).toBe(
            true,
        );
    });
});

describe("TypeScriptParser — external nodes", () => {
    it("does not emit external edges when include_external_nodes is false", () => {
        const { parse } = fixtureParser("external");
        const result = parse("index.ts", { include_external_nodes: false });

        expect(result.edges.some((e) => e.target.startsWith("##"))).toBe(false);
    });

    it("emits external library import edges when include_external_nodes is true", () => {
        const { parse } = fixtureParser("external");
        const result = parse("index.ts", { include_external_nodes: true });

        expect(hasEdge(result, "index.ts", "##graphology", "imports")).toBe(
            true,
        );
    });

    it("respects exclude_external list", () => {
        const { parse } = fixtureParser("external");
        const result = parse("index.ts", {
            include_external_nodes: true,
            exclude_external: ["graphology"],
        });

        expect(hasEdge(result, "index.ts", "##graphology", "imports")).toBe(
            false,
        );
    });
});
