import type { Graph, LayoutResult, ViewI } from "@dep-graph-vis/core";
import type { GraphRendererEvent, GraphRendererEventMap } from "./GraphRendererEvents";


export interface GraphRenderer {
    initialize(container: HTMLElement): void;
    destroy(): void;

    // Data
    setGraph(graph: Graph): void;
    setGraphWithLayout(graph: Graph, layout?: LayoutResult): void
    // setView(view: ViewI): void;

    // Interaction
    getSelectedNodes(): string[];
    setSelection(nodes: string[]): void;

    // Clusters
    // collapseCluster(clusterId: string): void;
    // expandCluster(clusterId: string): void;

    // fit view
    fitToView(): void;
    fitToNodes(nodes: string[]): void;

    // Type-safe event methods using generics
    on<K extends GraphRendererEvent>(
        event: K,
        handler: (data: GraphRendererEventMap[K]) => void,
    ): void;

    // off<K extends GraphRendererEvent>(
    //     event: K,
    //     handler: (data: GraphRendererEventMap[K]) => void,
    // ): void;
}
