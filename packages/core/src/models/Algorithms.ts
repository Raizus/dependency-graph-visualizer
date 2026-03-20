import { Graph, NodeAttributesI } from "./schema";

/**
 *
 * @param graph
 * @returns all nodes that belong to any cycle in the graph
 */
export function findNodesInCyles(graph: Graph): Set<string> {
    const nodes_in_cycle: Set<string> = new Set();

    const visited: Set<string> = new Set();
    const recursionStack = new Set<string>();

    function dfs(node: string, path: string[]) {
        visited.add(node);
        recursionStack.add(node);
        path.push(node);

        // Check neighbors for back edges
        graph.forEachOutNeighbor(node, (neighbor) => {
            if (!visited.has(neighbor)) dfs(neighbor, path);
            else if (recursionStack.has(neighbor)) {
                // Found a cycle - mark all nodes from neighbor onwards
                const cycleStart = path.indexOf(neighbor);
                for (let i = cycleStart; i < path.length; i++) {
                    nodes_in_cycle.add(path[i]);
                }
            }
        });

        recursionStack.delete(node);
        path.pop();
    }

    for (const node of graph.nodes()) {
        if (visited.has(node)) continue;
        dfs(node, []);
    }

    return nodes_in_cycle;
}

/**
 * Computes all nodes reachable from a given set of initial nodes in a directed graph
 * @param graph - A graphology Graph instance
 * @param initialNodes - Array of node keys to start the traversal from
 * @returns Set of all reachable node keys (including the initial nodes)
 */
export function findReachableNodes(
    graph: Graph,
    initialNodes: string[],
): Set<string> {
    const reachable = new Set<string>();
    const queue: string[] = [];

    // Initialize with initial nodes
    for (const node of initialNodes) {
        // Verify node exists in graph
        if (graph.hasNode(node)) {
            reachable.add(node);
            queue.push(node);
        }
    }

    // BFS traversal
    while (queue.length > 0) {
        const current = queue.shift()!;

        // Get all outbound neighbors (since it's a directed graph)
        const neighbors = graph.outNeighbors(current);

        for (const neighbor of neighbors) {
            if (!reachable.has(neighbor)) {
                reachable.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return reachable;
}

/**
 * Computes all nodes that can "reach" at least one node in the selection,
 * i.e. all nodes from which there exists a directed path to a node in the selection.
 * Excludes selected nodes from the result
 *
 * @param graph     A directed Graphology graph
 * @param selection The initial set of target nodes
 * @returns         A Set of all reaching nodes (excludes the selection itself unless
 *                  a selected node can also reach another selected node)
 */
export function findReachingNodes(
    graph: Graph,
    selection: string[],
): Set<string> {
    const selectionSet = new Set(selection);
    const visited = new Set<string>();
    const queue: string[] = [...selection];

    // We perform a reverse BFS: starting from the selected nodes,
    // we traverse edges *backwards* (in-neighbors) to find all ancestors.
    while (queue.length > 0) {
        const current = queue.shift()!;

        for (const neighbor of graph.inNeighbors(current)) {
            if (!visited.has(neighbor) && !selectionSet.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return visited;
}

export function tracePath(
    graph: Graph,
    from: string[],
    to: string[],
): Set<string> {
    const reachable = findReachableNodes(graph, from);
    const reaching = findReachingNodes(graph, to);
    const result: Set<string> = new Set();
    for (const node of reachable) {
        if (reaching.has(node)) {
            result.add(node);
        }
    }
    return result;
}

function nodeMatch(node_attr: NodeAttributesI, query: string): boolean {
    let regex: RegExp;
    try {
        regex = new RegExp(query, "i");
    } catch {
        // If query is not a valid regex, fall back to literal substring match
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        regex = new RegExp(escaped, "i");
    }
    return (
        regex.test(node_attr.key) ||
        regex.test(node_attr.label) ||
        regex.test(node_attr.full_path)
    );
}

export function searchGraphForNodes(graph: Graph, query: string): string[] {
    const results: string[] = [];
    graph.forEachNode((node_id, attributes) => {
        if (nodeMatch(attributes, query)) {
            results.push(node_id);
        }
    });
    return results;
}

export function topNodesByInDegree(graph: Graph, n: number): string[] {
    const nodesWithInDegree: { node: string; inDegree: number }[] = [];
    graph.forEachNode((node) => {
        nodesWithInDegree.push({ node, inDegree: graph.inDegree(node) });
    });
    nodesWithInDegree.sort((a, b) => b.inDegree - a.inDegree);
    return nodesWithInDegree.slice(0, n).map((entry) => entry.node);
}

export function topNodesByOutDegree(graph: Graph, n: number): string[] {
    const nodesWithOutDegree: { node: string; outDegree: number }[] = [];
    graph.forEachNode((node) => {
        nodesWithOutDegree.push({ node, outDegree: graph.outDegree(node) });
    });
    nodesWithOutDegree.sort((a, b) => b.outDegree - a.outDegree);
    return nodesWithOutDegree.slice(0, n).map((entry) => entry.node);
}
