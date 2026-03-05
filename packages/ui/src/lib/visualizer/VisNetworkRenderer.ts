import type { ClusterBox, Graph, LayoutResult, ViewI } from "@dep-graph-vis/core";
import { Network, type Options } from "vis-network";
import {
    visnetwork_build_projection,
    default_visnetwork_options,
} from "./build_projection";
import type { GraphRenderer } from "./GraphRenderer";
import type {
    GraphRendererEvent,
    GraphRendererEventMap,
} from "./GraphRendererEvents";

interface ClusterBoxBounds {
    clusterId: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    expanded: boolean;
}

export class VisNetworkRenderer implements GraphRenderer {
    private network: Network | null = null;
    private container: HTMLElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private overlayCanvas: HTMLCanvasElement | null = null;
    private overlayCtx: CanvasRenderingContext2D | null = null;
    private eventHandlers: Map<GraphRendererEvent, Set<Function>> = new Map();

    private clusterBoxes: ClusterBox[] = [];
    private clusterBoxBounds: ClusterBoxBounds[] = [];

    initialize(container: HTMLElement): void {
        this.container = container;
        const options: Options = default_visnetwork_options();

        this.network = new Network(
            this.container,
            { nodes: [], edges: [] },
            options,
        );

        // Get reference to vis-network canvas
        this.canvas = this.container.querySelector(
            "canvas",
        ) as HTMLCanvasElement;

        this.setupEventListeners();

        this.network.on("stabilizationIterationsDone", () => {
            console.log("disabling physics");
            if (this.network) {
                this.network.setOptions({
                    ...default_visnetwork_options(),
                    physics: false,
                    edges: {
                        smooth: true,
                        arrows: "to",
                    },
                });
            }
        });

        // Redraw cluster boxes when network moves/zooms
        this.network.on("afterDrawing", () => {
            this.drawClusterBoxes();
        });
    }

    /**
     * Set graph with optional pre-computed layout
     */
    setGraphWithLayout(graph: Graph, layout?: LayoutResult): void {
        if (!this.network) return;

        const nodes_and_edges = visnetwork_build_projection(graph, layout);

        // Disable physics if using custom layout
        if (layout) {
            this.network.setOptions({
                ...default_visnetwork_options(),
                physics: { enabled: false },
            });
        }

        this.network.setData(nodes_and_edges);

        // Fit to view after layout
        if (layout) {
            setTimeout(() => {
                this.network?.fit();
            }, 100);
        }
    }

    private setupEventListeners(): void {
        if (!this.container || !this.network) return;

        // Left click
        this.network.on("click", (params) => {
            if (params.nodes.length > 0) {
                this.emit("nodeClick", {
                    nodeId: params.nodes[0],
                    event: params.event as MouseEvent,
                });
            } else {
                this.emit("backgroundClick", {
                    event: params.event as MouseEvent,
                });
            }
        });

        // Double click
        this.network.on("doubleClick", (params) => {
            if (params.nodes.length > 0) {
                this.emit("nodeDoubleClick", {
                    nodeId: params.nodes[0],
                    event: params.event as MouseEvent,
                });
            }
        });

        // Right click - need to handle cluster boxes specially
        this.container.addEventListener("contextmenu", (event) => {
            event.preventDefault();

            const nodeId = this.network!.getNodeAt({
                x: event.offsetX,
                y: event.offsetY,
            });

            if (nodeId) {
                this.emit("nodeRightClick", {
                    nodeId: nodeId as string,
                    event: event,
                });
                return;
            }

            // Check if click is inside a cluster box
            const clickedBox = this.getClusterBoxAt(
                event.offsetX,
                event.offsetY,
            );

            if (clickedBox) {
                // Right-clicked inside a cluster box
                this.emit("clusterBoxRightClick", {
                    clusterId: clickedBox.clusterId,
                    event: event,
                });
                return;
            }

            this.emit("backgroundRightClick", {
                event: event,
            });
        });

        // Selection changed
        this.network.on("selectNode", () => {
            this.emit("selectionChanged", {
                nodes: this.network!.getSelectedNodes() as string[],
                edges: this.network!.getSelectedEdges() as string[],
            });
        });

        this.network.on("deselectNode", () => {
            this.emit("selectionChanged", {
                nodes: this.network!.getSelectedNodes() as string[],
                edges: this.network!.getSelectedEdges() as string[],
            });
        });
    }

    /**
     * Set cluster boxes to draw
     */
    setClusterBoxes(boxes: ClusterBox[]): void {
        this.clusterBoxes = boxes;
        this.drawClusterBoxes();
    }

    /**
     * Clear all cluster boxes
     */
    clearClusterBoxes(): void {
        this.clusterBoxes = [];
        this.clusterBoxBounds = [];
        this.clearOverlay();
    }

    /**
     * Check if a point is inside a cluster box
     */
    private getClusterBoxAt(x: number, y: number): ClusterBoxBounds | null {
        // Check in reverse order (top boxes first)
        for (let i = this.clusterBoxBounds.length - 1; i >= 0; i--) {
            const box = this.clusterBoxBounds[i];

            if (
                x >= box.x &&
                x <= box.x + box.width &&
                y >= box.y &&
                y <= box.y + box.height
            ) {
                return box;
            }
        }

        return null;
    }

    /**
     * Draw a rounded rectangle with label
     */
    private drawRoundedRect(
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        color: string,
        label: string,
    ): void {
        if (!this.overlayCtx) return;

        const ctx = this.overlayCtx;

        // Draw rounded rectangle border
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(
            x + width,
            y + height,
            x + width - radius,
            y + height,
            radius,
        );
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();

        // Fill with semi-transparent color
        ctx.fillStyle = color + "20"; // Add alpha for transparency
        ctx.fill();

        // Draw border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label at top-left
        ctx.font = "12px sans-serif";
        ctx.fillStyle = color;
        ctx.fillText(label, x + 8, y + 16);
    }

    /**
     * Clear overlay canvas
     */
    private clearOverlay(): void {
        if (!this.overlayCtx || !this.overlayCanvas) return;
        this.overlayCtx.clearRect(
            0,
            0,
            this.overlayCanvas.width,
            this.overlayCanvas.height,
        );
    }

    /**
     * Draw box around expanded cluster (contains multiple nodes)
     */
    private drawExpandedClusterBox(box: ClusterBox): void {
        if (!this.network || !this.overlayCtx) return;

        // Get positions of all nodes in this cluster
        const positions: Array<{ x: number; y: number }> = [];

        for (const nodeId of box.nodeIds) {
            try {
                const pos = this.network.getPosition(nodeId);
                if (pos.x !== undefined && pos.y !== undefined) {
                    const canvasPos = this.network.canvasToDOM(pos);
                    positions.push(canvasPos);
                }
            } catch (e) {
                // Node doesn't exist in network, skip it
                continue;
            }
        }

        if (positions.length === 0) return;

        // Calculate bounding box with padding
        const padding = 30;
        let minX = Infinity,
            minY = Infinity;
        let maxX = -Infinity,
            maxY = -Infinity;

        positions.forEach((pos) => {
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x);
            maxY = Math.max(maxY, pos.y);
        });

        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const width = maxX - minX;
        const height = maxY - minY;

        // Store bounds for click detection
        this.clusterBoxBounds.push({
            clusterId: box.clusterId,
            label: box.label,
            x: minX,
            y: minY,
            width,
            height,
            color: box.color,
            expanded: true,
        });

        // Draw rounded rectangle
        this.drawRoundedRect(
            minX,
            minY,
            width,
            height,
            10,
            box.color,
            box.label,
        );
    }

    /**
     * Draw box around collapsed cluster (single node)
     */
    private drawCollapsedClusterBox(box: ClusterBox): void {
        if (!this.network || !this.overlayCtx) return;

        try {
            // Get bounding box of the cluster node
            const boundingBox = this.network.getBoundingBox(box.clusterId);

            if (!boundingBox) return;

            // boundingBox has: { top, left, right, bottom }
            // Convert to canvas coordinates
            const topLeft = this.network.canvasToDOM({
                x: boundingBox.left,
                y: boundingBox.top,
            });
            const bottomRight = this.network.canvasToDOM({
                x: boundingBox.right,
                y: boundingBox.bottom,
            });

            const padding = 15;

            const x = topLeft.x - padding;
            const y = topLeft.y - padding;
            const width = bottomRight.x - topLeft.x + padding * 2;
            const height = bottomRight.y - topLeft.y + padding * 2;

            // Store bounds
            this.clusterBoxBounds.push({
                clusterId: box.clusterId,
                label: box.label,
                x,
                y,
                width,
                height,
                color: box.color,
                expanded: false,
            });

            // Draw rounded rectangle
            this.drawRoundedRect(x, y, width, height, 8, box.color, box.label);
        } catch (e) {
            // Node doesn't exist, skip
            console.warn(`Could not draw cluster box for ${box.clusterId}:`, e);
        }
    }

    /**
     * Draw cluster boxes on overlay canvas
     */
    private drawClusterBoxes(): void {
        if (!this.overlayCtx || !this.network) return;

        this.clearOverlay();
        this.clusterBoxBounds = [];

        for (const box of this.clusterBoxes) {
            if (box.expanded) {
                // Draw box around all nodes in cluster
                this.drawExpandedClusterBox(box);
            } else {
                // Draw box around single collapsed cluster node
                this.drawCollapsedClusterBox(box);
            }
        }
    }

    destroy(): void {
        if (this.network) {
            this.network.destroy();
            this.network = null;
        }
        this.eventHandlers.clear();
    }

    setGraph(graph: Graph): void {
        if (!this.network) return;
        console.log("set graph");
        const data = visnetwork_build_projection(graph);
        this.network.setData(data);
        this.network.setOptions(default_visnetwork_options());
    }

    getSelectedNodes(): string[] {
        const nodes = this.network!.getSelectedNodes() as string[];
        return nodes;
    }

    setSelection(nodes: string[]): void {
        const selection = {
            nodes,
        };
        this.network!.setSelection(selection);
    }

    on<K extends GraphRendererEvent>(
        event: K,
        handler: (data: GraphRendererEventMap[K]) => void,
    ): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
    }

    fitToView(): void {
        if (!this.network) return;
        this.network.fit();
    }

    fitToNodes(nodes: string[]): void {
        if (!this.network) return;
        this.network.fit({ nodes });
    }

    private emit(event: GraphRendererEvent, data: any): void {
        this.eventHandlers.get(event)?.forEach((handler) => handler(data));
    }
}
