import type { ClustersI, Graph } from "@dep-graph-vis/core";
import type { GraphRendererEvent, GraphRendererEventMap } from "./GraphRendererEvents";


export interface GraphRenderer {
    initialize(container: HTMLElement): void;
    destroy(): void;

    // Data
    // setGraph(graph: Graph): void;
    // setView(view: ViewI): void;
    setSvgLayout(graph: Graph, clusters: ClustersI, svgString: string): void;

    // Interaction
    getSelectedNodes(): string[];
    setSelection(nodes: string[]): void;

    // Clusters
    // collapseCluster(clusterId: string): void;
    // expandCluster(clusterId: string): void;

    hideNodes(nodes: Set<string>): void;
    showNodes(nodes: Set<string>): void;

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
