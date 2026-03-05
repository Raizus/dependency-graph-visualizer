import type { ClustersI, Graph } from "@dep-graph-vis/core";
import * as d3 from "d3";
import type { GraphRendererEvent, GraphRendererEventMap } from "./GraphRendererEvents";


// ─── Renderer Interface ───────────────────────────────────────────────────────

export interface GraphRendererInterface {
    initialize(container: HTMLElement): void;
    setLayout(graph: Graph, clusters: ClustersI[], svg: string): void;

    getSelectedNodes(): string[];
    setSelection(nodes: string[]): void;

    fitToView(): void;
    fitToNodes(nodes: string[]): void;

    hideNodes(nodes: string[]): void;
    showNodes(nodes: string[]): void;

    on<K extends GraphRendererEvent>(
        event: K,
        handler: (data: GraphRendererEventMap[K]) => void,
    ): void;
}

// ─── CSS Classes & Constants ──────────────────────────────────────────────────

const CSS = {
    node: "gr-node",
    edge: "gr-edge",
    cluster: "gr-cluster",
    nodeHovered: "gr-node--hovered",
    nodeSelected: "gr-node--selected",
    edgeHovered: "gr-edge--hovered",
    edgeSelected: "gr-edge--selected",
    edgeDimmed: "gr-edge--dimmed",
    nodeDimmed: "gr-node--dimmed",
    hidden: "gr-hidden",
} as const;

const TRANSITION_MS = 150;

// ─── Implementation ───────────────────────────────────────────────────────────

export class GraphRenderer implements GraphRendererInterface {
    private container: HTMLElement | null = null;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
        null;
    private zoomGroup: d3.Selection<
        SVGGElement,
        unknown,
        null,
        undefined
    > | null = null;
    private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

    // Graph data
    private graph: Graph | null = null;
    private clusters: ClustersI[] = [];

    // Maps from graphviz <title> text → DOM group element
    private nodeGroupMap = new Map<string, SVGGElement>();
    private edgeGroupMap = new Map<string, SVGGElement>();
    private clusterGroupMap = new Map<string, SVGGElement>();

    // Adjacency: nodeId → Set of connected edgeIds
    private nodeEdgeMap = new Map<string, Set<string>>();

    // Selection state
    private selectedNodes = new Set<string>();
    private selectedEdges = new Set<string>();

    // Event handlers
    private handlers = new Map<
        GraphRendererEvent,
        Array<(data: unknown) => void>
    >();

    // ── Public API ──────────────────────────────────────────────────────────────

    initialize(container: HTMLElement): void {
        this.container = container;
        container.style.position = "relative";
        container.style.overflow = "hidden";

        // Inject stylesheet
        this.injectStyles();

        // Create SVG element that will be replaced on each setLayout call
        this.createSvgShell();
    }

    setLayout(graph: Graph, clusters: ClustersI[], svgString: string): void {
        if (!this.container) throw new Error("GraphRenderer not initialized");
        const t0 = performance.now();

        this.graph = graph;
        this.clusters = clusters;

        // Clear old state
        this.nodeGroupMap.clear();
        this.edgeGroupMap.clear();
        this.clusterGroupMap.clear();
        this.nodeEdgeMap.clear();
        this.selectedNodes.clear();
        this.selectedEdges.clear();

        // Parse the Graphviz SVG
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        const rawSvg = doc.querySelector("svg");
        if (!rawSvg) throw new Error("Invalid SVG string");

        // Replace existing SVG
        this.container.innerHTML = "";
        this.createSvgShell();

        if (!this.svg || !this.zoomGroup) return;

        // Move all graphviz children into the zoom group
        Array.from(rawSvg.children).forEach((child) => {
            this.zoomGroup!.node()!.appendChild(document.adoptNode(child));
        });

        // Copy viewBox / dimensions for initial fit
        const vb = rawSvg.getAttribute("viewBox");
        if (vb) this.svg.attr("viewBox", vb);

        // Index groups by their <title> text
        this.indexGroups();

        // Build adjacency map
        this.buildAdjacency();

        // Attach interaction listeners
        this.attachListeners();

        // Fit to view
        this.fitToView();

        const duration = performance.now() - t0;
        this.emit("layoutComplete", { duration });
    }

    getSelectedNodes(): string[] {
        return [...this.selectedNodes];
    }

    setSelection(nodes: string[]): void {
        // Clear previous selection visuals
        this.selectedNodes.forEach((id) => this.applyNodeStyle(id, "normal"));
        this.selectedEdges.forEach((id) => this.applyEdgeStyle(id, "normal"));

        this.selectedNodes = new Set(nodes);
        this.selectedEdges = new Set<string>();

        // Collect connected edges
        nodes.forEach((nodeId) => {
            const edges = this.nodeEdgeMap.get(nodeId);
            if (edges) edges.forEach((e) => this.selectedEdges.add(e));
        });

        // Apply selected styles
        this.selectedNodes.forEach((id) => this.applyNodeStyle(id, "selected"));
        this.selectedEdges.forEach((id) => this.applyEdgeStyle(id, "selected"));

        this.emit("selectionChanged", {
            nodes: [...this.selectedNodes],
            edges: [...this.selectedEdges],
        });
    }

    fitToView(): void {
        if (!this.svg || !this.zoomGroup || !this.zoom || !this.container)
            return;
        const bbox = (this.zoomGroup.node() as SVGGElement).getBBox();
        this.zoomToBox(bbox);
    }

    fitToNodes(nodes: string[]): void {
        if (!this.svg || !this.zoomGroup || !this.zoom || !this.container)
            return;

        // Union bounding boxes of all requested nodes
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        let found = false;

        nodes.forEach((id) => {
            const el = this.nodeGroupMap.get(id);
            if (!el) return;
            const bb = el.getBBox();
            minX = Math.min(minX, bb.x);
            minY = Math.min(minY, bb.y);
            maxX = Math.max(maxX, bb.x + bb.width);
            maxY = Math.max(maxY, bb.y + bb.height);
            found = true;
        });

        if (!found) return;
        this.zoomToBox({
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        });
    }

    hideNodes(nodes: string[]): void {
        nodes.forEach((id) => {
            const el = this.nodeGroupMap.get(id);
            if (el) el.classList.add(CSS.hidden);

            // Also hide connected edges
            this.nodeEdgeMap.get(id)?.forEach((edgeId) => {
                const edge = this.edgeGroupMap.get(edgeId);
                if (edge) edge.classList.add(CSS.hidden);
            });
        });
    }

    showNodes(nodes: string[]): void {
        nodes.forEach((id) => {
            // remove css hidden class from node group
            const el = this.nodeGroupMap.get(id);
            if (el) el.classList.remove(CSS.hidden);

            this.nodeEdgeMap.get(id)?.forEach((edgeId) => {
                // Only show the edge if BOTH endpoints are visible
                const edge = this.edgeGroupMap.get(edgeId);
                if (!edge) return;

                // find edge in graph
                const edgeData = this.graph?.edge(edgeId);
                this.graph?.e
                if (!edgeData) return;
                const srcHidden = this.nodeGroupMap
                    .get(edgeData.source)
                    ?.classList.contains(CSS.hidden);
                const tgtHidden = this.nodeGroupMap
                    .get(edgeData.target)
                    ?.classList.contains(CSS.hidden);
                if (!srcHidden && !tgtHidden) edge.classList.remove(CSS.hidden);
            });
        });
    }

    on<K extends GraphRendererEvent>(
        event: K,
        handler: (data: GraphRendererEventMap[K]) => void,
    ): void {
        if (!this.handlers.has(event)) this.handlers.set(event, []);
        this.handlers.get(event)!.push(handler as (data: unknown) => void);
    }

    // ── Private Helpers ─────────────────────────────────────────────────────────

    private createSvgShell(): void {
        if (!this.container) return;

        const svgEl = d3
            .select(this.container)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("display", "block");

        this.svg = svgEl as unknown as d3.Selection<
            SVGSVGElement,
            unknown,
            null,
            undefined
        >;

        const g = this.svg.append("g").attr("class", "gr-zoom-root");
        this.zoomGroup = g;

        // Set up zoom
        this.zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.05, 8])
            .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
                g.attr("transform", event.transform.toString());
            });

        this.svg.call(this.zoom);

        // Background click / right-click
        this.svg.on("click", (event: MouseEvent) => {
            if ((event.target as SVGElement) === this.svg!.node()) {
                this.emit("backgroundClick", { event });
            }
        });

        this.svg.on("contextmenu", (event: MouseEvent) => {
            if ((event.target as SVGElement) === this.svg!.node()) {
                event.preventDefault();
                this.emit("backgroundRightClick", { event });
            }
        });
    }

    /**
     * Walk all <g> elements. Graphviz assigns class="node", "edge", or "cluster"
     * and places a <title> child with the logical id.
     */
    private indexGroups(): void {
        if (!this.zoomGroup) return;
        const root = this.zoomGroup.node() as SVGGElement;

        root.querySelectorAll("g.node").forEach((el) => {
            const title = el.querySelector("title")?.textContent?.trim();
            if (title) {
                this.nodeGroupMap.set(title, el as SVGGElement);
                el.classList.add(CSS.node);
                el.setAttribute("data-node-id", title);
            }
        });

        root.querySelectorAll("g.edge").forEach((el) => {
            const title = el.querySelector("title")?.textContent?.trim();
            if (title) {
                // Graphviz edge titles are like "source->target" – we match to our edge ids
                const edgeId = this.resolveEdgeId(title);
                const key = edgeId ?? title;
                this.edgeGroupMap.set(key, el as SVGGElement);
                el.classList.add(CSS.edge);
                el.setAttribute("data-edge-id", key);
            }
        });

        root.querySelectorAll("g.cluster").forEach((el) => {
            const title = el.querySelector("title")?.textContent?.trim();
            if (title) {
                // Graphviz cluster titles are like "cluster_foo" → strip prefix
                const clusterId = title.replace(/^cluster_/, "");
                this.clusterGroupMap.set(clusterId, el as SVGGElement);
                el.classList.add(CSS.cluster);
                el.setAttribute("data-cluster-id", clusterId);
            }
        });
    }

    /**
     * Graphviz edge title format: "source->target" or "source--target".
     * Try to find the matching edge in the graph data.
     */
    private resolveEdgeId(title: string): string | null {
        if (!this.graph) return null;
        const parts = title.split(/->|--/);
        if (parts.length < 2) return null;
        const [src, tgt] = parts.map((s) => s.trim());
        const match = this.graph.edge(src, tgt);
        return match ?? null;
    }

    /** Build nodeId → edgeId[] adjacency for fast lookup */
    private buildAdjacency(): void {
        if (!this.graph) return;
        this.graph.forEachEdge((edge, _, source, target) => {
            [source, target].forEach((nodeId) => {
                if (!this.nodeEdgeMap.has(nodeId))
                    this.nodeEdgeMap.set(nodeId, new Set());
                this.nodeEdgeMap.get(nodeId)!.add(edge);
            });
        });
    }

    private attachListeners(): void {
        // ── Node interactions ──
        this.nodeGroupMap.forEach((el, nodeId) => {
            const sel = d3.select(el);

            sel.on("mouseenter", () => {
                if (!this.selectedNodes.has(nodeId))
                    this.applyNodeStyle(nodeId, "hovered");
                // Highlight connected edges
                this.nodeEdgeMap.get(nodeId)?.forEach((edgeId) => {
                    if (!this.selectedEdges.has(edgeId))
                        this.applyEdgeStyle(edgeId, "hovered");
                });
                // Dim unconnected nodes
                this.dimUnconnected(nodeId, true);
            });

            sel.on("mouseleave", () => {
                if (!this.selectedNodes.has(nodeId))
                    this.applyNodeStyle(nodeId, "normal");
                this.nodeEdgeMap.get(nodeId)?.forEach((edgeId) => {
                    if (!this.selectedEdges.has(edgeId))
                        this.applyEdgeStyle(edgeId, "normal");
                });
                this.dimUnconnected(nodeId, false);
            });

            sel.on("click", (event: MouseEvent) => {
                event.stopPropagation();

                if (event.shiftKey || event.metaKey || event.ctrlKey) {
                    // Multi-select toggle
                    const newSet = new Set(this.selectedNodes);
                    if (newSet.has(nodeId)) newSet.delete(nodeId);
                    else newSet.add(nodeId);
                    this.setSelection([...newSet]);
                } else {
                    this.setSelection([nodeId]);
                }

                this.emit("nodeClick", { nodeId, event });
            });

            sel.on("dblclick", (event: MouseEvent) => {
                event.stopPropagation();
                this.emit("nodeDoubleClick", { nodeId, event });
            });

            sel.on("contextmenu", (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.emit("nodeRightClick", { nodeId, event });
            });
        });

        // ── Edge interactions ──
        this.edgeGroupMap.forEach((el, edgeId) => {
            d3.select(el).on("click", (event: MouseEvent) => {
                event.stopPropagation();
                this.emit("edgeClick", { edgeId, event });
            });
        });

        // ── Cluster interactions ──
        this.clusterGroupMap.forEach((el, clusterId) => {
            d3.select(el).on("contextmenu", (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.emit("clusterBoxRightClick", { clusterId, event });
            });
        });
    }

    // ── Visual Styling ──────────────────────────────────────────────────────────

    private applyNodeStyle(
        nodeId: string,
        state: "normal" | "hovered" | "selected",
    ): void {
        const el = this.nodeGroupMap.get(nodeId);
        if (!el) return;
        el.classList.remove(CSS.nodeHovered, CSS.nodeSelected, CSS.nodeDimmed);
        if (state === "hovered") el.classList.add(CSS.nodeHovered);
        if (state === "selected") el.classList.add(CSS.nodeSelected);
    }

    private applyEdgeStyle(
        edgeId: string,
        state: "normal" | "hovered" | "selected",
    ): void {
        const el = this.edgeGroupMap.get(edgeId);
        if (!el) return;
        el.classList.remove(CSS.edgeHovered, CSS.edgeSelected, CSS.edgeDimmed);
        if (state === "hovered") el.classList.add(CSS.edgeHovered);
        if (state === "selected") el.classList.add(CSS.edgeSelected);
    }

    /** Dim all nodes/edges that are NOT connected to `nodeId` during hover */
    private dimUnconnected(nodeId: string, dim: boolean): void {
        const connectedNodes = new Set<string>([nodeId]);
        const connectedEdges =
            this.nodeEdgeMap.get(nodeId) ?? new Set<string>();

        // Gather the other endpoints
        connectedEdges.forEach((edgeId) => {
            const edge = this.graph?.edges.find((e) => e.id === edgeId);
            if (edge) {
                connectedNodes.add(edge.source);
                connectedNodes.add(edge.target);
            }
        });

        this.nodeGroupMap.forEach((el, id) => {
            if (!connectedNodes.has(id)) {
                if (dim) el.classList.add(CSS.nodeDimmed);
                else el.classList.remove(CSS.nodeDimmed);
            }
        });

        this.edgeGroupMap.forEach((el, id) => {
            if (!connectedEdges.has(id)) {
                if (dim) el.classList.add(CSS.edgeDimmed);
                else el.classList.remove(CSS.edgeDimmed);
            }
        });
    }

    // ── Zoom helpers ────────────────────────────────────────────────────────────

    private zoomToBox(bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void {
        if (!this.svg || !this.zoom || !this.container) return;
        const { width: W, height: H } = this.container.getBoundingClientRect();
        if (!W || !H || !bbox.width || !bbox.height) return;

        const padding = 40;
        const scale = Math.min(
            (W - padding * 2) / bbox.width,
            (H - padding * 2) / bbox.height,
            8,
        );
        const tx = W / 2 - scale * (bbox.x + bbox.width / 2);
        const ty = H / 2 - scale * (bbox.y + bbox.height / 2);

        this.svg
            .transition()
            .duration(400)
            .call(
                this.zoom!.transform,
                d3.zoomIdentity.translate(tx, ty).scale(scale),
            );
    }

    // ── Event Emitter ───────────────────────────────────────────────────────────

    private emit<K extends GraphRendererEvent>(
        event: K,
        data: GraphRendererEventMap[K],
    ): void {
        this.handlers.get(event)?.forEach((h) => h(data));
    }

    // ── Stylesheet ──────────────────────────────────────────────────────────────

    private injectStyles(): void {
        const id = "graph-renderer-styles";
        if (document.getElementById(id)) return;

        const style = document.createElement("style");
        style.id = id;
        style.textContent = `
      /* Node states */
      .${CSS.node} { cursor: pointer; transition: opacity ${TRANSITION_MS}ms ease; }
      .${CSS.nodeHovered} * { filter: brightness(1.15) drop-shadow(0 0 4px rgba(100,160,255,0.6)); }
      .${CSS.nodeSelected} * { filter: drop-shadow(0 0 6px rgba(60,130,255,0.9)); }
      .${CSS.nodeDimmed} { opacity: 0.25; }

      /* Edge states */
      .${CSS.edge} { cursor: default; transition: opacity ${TRANSITION_MS}ms ease; }
      .${CSS.edgeHovered} path,
      .${CSS.edgeHovered} polygon { stroke: #4a90e2 !important; stroke-width: 2px !important; }
      .${CSS.edgeSelected} path,
      .${CSS.edgeSelected} polygon { stroke: #2563eb !important; stroke-width: 2.5px !important; }
      .${CSS.edgeDimmed} { opacity: 0.15; }

      /* Cluster */
      .${CSS.cluster} { cursor: default; }

      /* Hidden */
      .${CSS.hidden} { display: none !important; }
    `;
        document.head.appendChild(style);
    }
}
