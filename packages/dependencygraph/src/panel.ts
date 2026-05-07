import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class DependencyGraphPanel {
    static currentPanel: DependencyGraphPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;

    static createOrShow(extensionUri: vscode.Uri) {
        const graphData = DependencyGraphPanel.findGraphJson();

        if (DependencyGraphPanel.currentPanel) {
            DependencyGraphPanel.currentPanel._panel.reveal();
            DependencyGraphPanel.currentPanel._panel.webview.html =
                DependencyGraphPanel.currentPanel._getHtml(graphData);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "depGraph",
            "Dependency Graph",
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, "dist")],
            },
        );

        DependencyGraphPanel.currentPanel = new DependencyGraphPanel(
            panel,
            extensionUri,
            graphData,
        );
    }

    // Look for .dependencygraph/graph.json in the open workspace
    static findGraphJson(): object | null {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return null;
        }

        for (const folder of workspaceFolders) {
            const graphPath = path.join(
                folder.uri.fsPath,
                ".dependencygraph",
                "graph.json",
            );
            if (fs.existsSync(graphPath)) {
                try {
                    const raw = fs.readFileSync(graphPath, "utf-8");
                    return JSON.parse(raw);
                } catch {
                    vscode.window.showErrorMessage(
                        "Failed to parse .dependencygraph/graph.json",
                    );
                    return null;
                }
            }
        }

        vscode.window.showWarningMessage(
            "No .dependencygraph/graph.json found in workspace.",
        );
        return null;
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        graphData: object | null,
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._panel.webview.html = this._getHtml(graphData);
        this._panel.onDidDispose(() => {
            DependencyGraphPanel.currentPanel = undefined;
        });
    }

    private _getHtml(graphData: object | null): string {
        const scriptUri = this._panel.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "dist", "webview.js"),
        );

        const cssUri = this._panel.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "dist", "webview.css"),
        );

        const nonce = getNonce();
        return `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="${cssUri}">
    <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; script-src 'nonce-${nonce}' 'unsafe-eval'; style-src 'unsafe-inline' ${this._panel.webview.cspSource}; connect-src vscode-resource:;">
    <style>
        html, body, #app { width: 100%; height: 100%; margin: 0; padding: 0; }
    </style>
</head>
<body>
    <div id="app"></div>
    <script nonce="${nonce}">
        window.__GRAPH_DATA__ = ${JSON.stringify(graphData ?? {})};
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}

function getNonce() {
    return [...crypto.getRandomValues(new Uint8Array(16))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
