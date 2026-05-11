import ts from "typescript";
import * as path from "path";
import type { ParserPlugin, ParseResult, ParserSettings, Edge } from "./ParserPlugin";
import { NodeAttributesI } from "../models";

function addClassDeclaration(
    name: string,
    fileKey: string,
    nodes: NodeAttributesI[],
    edges: Edge[],
) {
    const key = `${fileKey}##${name}`;
    nodes.push({ key, label: name, type: "class" });
    edges.push({ source: fileKey, target: key, type: "contains" });
}

function addVariableStatement(
    name: string,
    fileKey: string,
    nodes: NodeAttributesI[],
    edges: Edge[],
) {
    const key = `${fileKey}##${name}`;
    nodes.push({ key, label: name, type: "function" });
    edges.push({
        source: fileKey,
        target: key,
        type: "contains",
    });
}

export class TypescriptParser implements ParserPlugin {
    supportedExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

    private program: ts.Program | null = null;
    private projectRoot: string = "";

    initProject(projectRoot: string, configPath?: string): void {
        this.projectRoot = projectRoot;

        let compilerOptions: ts.CompilerOptions = {
            allowJs: true,
            resolveJsonModule: true,
            moduleResolution: ts.ModuleResolutionKind.NodeNext,
        };

        if (configPath) {
            const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
            const parsed = ts.parseJsonConfigFileContent(
                configFile.config,
                ts.sys,
                path.dirname(configPath),
            );
            compilerOptions = parsed.options;
        }

        const fileNames = ts.sys
            .readDirectory(projectRoot, this.supportedExtensions)
            .filter((f) => !f.includes("node_modules"));

        this.program = ts.createProgram(fileNames, compilerOptions);
    }

    parseFile(
        filePath: string,
        content: string,
        settings: ParserSettings,
    ): ParseResult {
        if (!this.program)
            throw new Error("Call initProject() before parseFile()");

        const sourceFile = this.program.getSourceFile(filePath);
        if (!sourceFile) return { nodes: [], edges: [] };

        const checker = this.program.getTypeChecker();
        const nodes: NodeAttributesI[] = [];
        const edges: Edge[] = [];
        const fileKey = this.toKey(filePath);

        // Build a map of: imported symbol name -> target node key
        // e.g. "funcB" -> "path/to/file_b##funcB"
        const importedSymbols = new Map<string, string>();
        this.collectImports(
            sourceFile,
            filePath,
            fileKey,
            settings,
            edges,
            importedSymbols,
        );

        // Parse top-level declarations
        for (const node of sourceFile.statements) {
            this.visitTopLevel(
                node,
                fileKey,
                filePath,
                checker,
                importedSymbols,
                nodes,
                edges,
            );
        }

        return { nodes, edges };
    }

    /**
     * Processes imports, populates the importedSymbols map, and adds file-level import edges.
     * Does NOT create edges from the file to individual imported symbols —
     * those edges are only created if a symbol is used at the top level or inside a declaration.
     */
    private collectImports(
        sourceFile: ts.SourceFile,
        filePath: string,
        fileKey: string,
        settings: ParserSettings,
        edges: Edge[],
        importedSymbols: Map<string, string>,
    ): void {
        for (const statement of sourceFile.statements) {
            if (!ts.isImportDeclaration(statement)) continue;
            if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;

            const rawSpecifier = statement.moduleSpecifier.text;
            const resolvedFile = this.resolveImport(filePath, rawSpecifier);

            if (resolvedFile) {
                const targetFileKey = this.toKey(resolvedFile);
                edges.push({
                    source: fileKey,
                    target: targetFileKey,
                    type: "imports",
                });

                // Map each named import to its symbol key in the target file
                const namedBindings = statement.importClause?.namedBindings;
                if (namedBindings && ts.isNamedImports(namedBindings)) {
                    for (const specifier of namedBindings.elements) {
                        const exportedName = (
                            specifier.propertyName ?? specifier.name
                        ).text;
                        const localName = specifier.name.text;
                        importedSymbols.set(
                            localName,
                            `${targetFileKey}##${exportedName}`,
                        );
                    }
                }

                // Default import: import MyClass from "./file"
                const defaultImport = statement.importClause?.name;
                if (defaultImport) {
                    importedSymbols.set(defaultImport.text, targetFileKey);
                }
            } else if (settings.include_external_nodes) {
                const libName = rawSpecifier.split("/")[0].replace(/^@/, "");
                if (!settings.exclude_external.includes(libName)) {
                    edges.push({
                        source: fileKey,
                        target: `##${libName}`,
                        type: "imports",
                    });
                }
            }
        }
    }

    /**
     * Visits a top-level statement. If it declares a function or class, registers
     * a node for it, then walks its body to find call/usage edges to other symbols.
     * For top-level calls (not inside any declaration), edges originate from the file node.
     */
    private visitTopLevel(
        node: ts.Statement,
        fileKey: string,
        filePath: string,
        checker: ts.TypeChecker,
        importedSymbols: Map<string, string>,
        nodes: NodeAttributesI[],
        edges: Edge[],
    ): void {
        // function declaration
        if (ts.isFunctionDeclaration(node) && node.name) {
            const key = `${fileKey}##${node.name.text}`;
            nodes.push({ key, label: node.name.text, type: "function" });
            edges.push({ source: fileKey, target: key, type: "contains" });
            if (node.body) {
                this.collectCallEdges(
                    node.body,
                    key,
                    fileKey,
                    importedSymbols,
                    edges,
                    checker,
                );
            }
            return;
        }

        // class declaration
        if (ts.isClassDeclaration(node) && node.name) {
            const key = `${fileKey}##${node.name.text}`;
            addClassDeclaration(node.name.text, fileKey, nodes, edges);

            for (const member of node.members) {
                if (
                    (ts.isMethodDeclaration(member) ||
                        ts.isConstructorDeclaration(member)) &&
                    member.body
                ) {
                    this.collectCallEdges(
                        member.body,
                        key,
                        fileKey,
                        importedSymbols,
                        edges,
                        checker,
                    );
                }
            }
            return;
        }

        // const myFn = () => {} / const myFn = function() {}
        if (ts.isVariableStatement(node)) {
            for (const decl of node.declarationList.declarations) {
                if (
                    ts.isIdentifier(decl.name) &&
                    decl.initializer &&
                    (ts.isArrowFunction(decl.initializer) ||
                        ts.isFunctionExpression(decl.initializer))
                ) {
                    const name = decl.name.text;
                    const key = `${fileKey}##${name}`;
                    addVariableStatement(name, fileKey, nodes, edges);

                    if (
                        decl.initializer.body &&
                        !ts.isToken(decl.initializer.body)
                    ) {
                        this.collectCallEdges(
                            decl.initializer.body as ts.Block,
                            key,
                            fileKey,
                            importedSymbols,
                            edges,
                            checker,
                        );
                    }
                    return;
                }
            }
        }

        // Top-level statement (not inside a function/class): edges come from the file node
        this.collectCallEdges(
            node,
            fileKey,
            fileKey,
            importedSymbols,
            edges,
            checker,
        );
    }

    /**
     * Recursively walks a node's subtree looking for identifiers that match
     * imported symbols or locally defined symbols, and creates "calls" edges.
     *
     * @param scope     — the key of the function/class/file that owns this code
     * @param fileKey   — always the containing file key (for local symbol resolution)
     */
    private collectCallEdges(
        node: ts.Node,
        scope: string,
        fileKey: string,
        importedSymbols: Map<string, string>,
        edges: Edge[],
        checker: ts.TypeChecker,
    ): void {
        const visit = (n: ts.Node) => {
            if (ts.isCallExpression(n)) {
                const target = this.resolveCallTarget(
                    n.expression,
                    fileKey,
                    importedSymbols,
                    checker,
                );
                if (target && target !== scope) {
                    edges.push({ source: scope, target, type: "calls" });
                }
            }
            // new MyClass()
            if (ts.isNewExpression(n)) {
                const target = this.resolveCallTarget(
                    n.expression,
                    fileKey,
                    importedSymbols,
                    checker,
                );
                if (target && target !== scope) {
                    edges.push({ source: scope, target, type: "instantiates" });
                }
            }
            ts.forEachChild(n, visit);
        };
        ts.forEachChild(node, visit);
    }

    /**
     * Given the expression of a call/new, tries to resolve it to a node key.
     * Handles: bare identifiers (funcB), member access (obj.method), and
     * cross-file symbols via the importedSymbols map.
     */
    private resolveCallTarget(
        expr: ts.Expression,
        fileKey: string,
        importedSymbols: Map<string, string>,
        checker: ts.TypeChecker,
    ): string | null {
        if (ts.isIdentifier(expr)) {
            const name = expr.text;
            // Check imported symbols first
            if (importedSymbols.has(name)) return importedSymbols.get(name)!;
            // Otherwise assume it's a local symbol
            return `${fileKey}##${name}`;
        }

        if (ts.isPropertyAccessExpression(expr)) {
            const objName = ts.isIdentifier(expr.expression)
                ? expr.expression.text
                : null;
            const methodName = expr.name.text;
            if (objName && importedSymbols.has(objName)) {
                // e.g. import * as utils from "./utils" then utils.helperFn()
                return `${importedSymbols.get(objName)}##${methodName}`;
            }
        }

        return null;
    }

    private resolveImport(fromFile: string, specifier: string): string | null {
        if (!this.program || !specifier.startsWith(".")) return null;
        const resolved = ts.resolveModuleName(
            specifier,
            fromFile,
            this.program.getCompilerOptions(),
            ts.sys,
        );
        return resolved.resolvedModule?.resolvedFileName ?? null;
    }

    private toKey(absPath: string): string {
        return path.relative(this.projectRoot, absPath).replace(/\\/g, "/");
    }
}
