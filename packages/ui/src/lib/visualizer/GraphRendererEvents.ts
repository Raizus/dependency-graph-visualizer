
// Define event data types
export interface NodeClickEvent {
    nodeId: string;
    event: MouseEvent;
}

export interface NodeDoubleClickEvent {
    nodeId: string;
    event: MouseEvent;
}

export interface NodeRightClickEvent {
    nodeId: string;
    event: MouseEvent;
}

export interface EdgeClickEvent {
    edgeId: string;
    event: MouseEvent;
}

export interface BackgroundClickEvent {
    event: MouseEvent;
}

export interface BackgroundRightClickEvent {
    event: MouseEvent;
}

export interface SelectionChangedEvent {
    nodes: string[];
    edges: string[];
}

export interface LayoutCompleteEvent {
    duration: number;
}


export interface ClusterBoxRightClickEvent {
    clusterId: string;
    event: MouseEvent;
}

// Map event names to their data types
export interface GraphRendererEventMap {
    nodeClick: NodeClickEvent;
    nodeDoubleClick: NodeDoubleClickEvent;
    nodeRightClick: NodeRightClickEvent;
    edgeClick: EdgeClickEvent;
    backgroundClick: BackgroundClickEvent;
    backgroundRightClick: BackgroundRightClickEvent;
    selectionChanged: SelectionChangedEvent;
    layoutComplete: LayoutCompleteEvent;
    clusterBoxRightClick: ClusterBoxRightClickEvent;
}

// Event names (derived from the map)
export type GraphRendererEvent = keyof GraphRendererEventMap;
