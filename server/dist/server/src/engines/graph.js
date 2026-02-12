"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphEngine = void 0;
const base_1 = require("./base");
class GraphEngine extends base_1.AlgorithmEngine {
    execute(input) {
        switch (input.type) {
            case 'dfs':
                return this.dfs(input.nodes, input.edges, input.startNode);
            case 'bfs':
                return this.bfs(input.nodes, input.edges, input.startNode);
            case 'dijkstra':
                return this.dijkstra(input.nodes, input.edges, input.startNode);
            default:
                throw new Error('Algorithm not supported');
        }
    }
    dijkstra(nodes, edges, startNode) {
        const snapshots = [];
        const adj = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.source].push({ node: e.target, weight: e.weight || 1 });
            adj[e.target].push({ node: e.source, weight: e.weight || 1 });
        });
        const distances = {};
        const previous = {};
        const pq = [];
        nodes.forEach(n => {
            distances[n.id] = Infinity;
            previous[n.id] = null;
        });
        distances[startNode] = 0;
        pq.push({ node: startNode, dist: 0 });
        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [0],
            description: `Initializing Dijkstra from ${startNode}`,
            variables: { distances: { ...distances }, pq: [...pq] },
        });
        while (pq.length > 0) {
            pq.sort((a, b) => a.dist - b.dist);
            const { node: u, dist } = pq.shift();
            if (dist > distances[u])
                continue;
            snapshots.push({
                dataStructureState: { nodes, edges },
                currentNodeId: u,
                highlightedLineIds: [1],
                description: `Extracting node ${u} with minimum distance ${dist}`,
                variables: { distances: { ...distances }, pq: [...pq], visiting: u },
            });
            for (const { node: v, weight } of adj[u]) {
                const alt = distances[u] + weight;
                if (alt < distances[v]) {
                    distances[v] = alt;
                    previous[v] = u;
                    pq.push({ node: v, dist: alt });
                    snapshots.push({
                        dataStructureState: { nodes, edges },
                        currentNodeId: v,
                        highlightedLineIds: [2],
                        description: `Relaxing edge ${u} -> ${v}: new distance ${alt}`,
                        variables: { distances: { ...distances }, pq: [...pq], neighbor: v },
                    });
                }
            }
        }
        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [3],
            description: 'Dijkstra complete!',
            variables: { distances: { ...distances } },
        });
        return snapshots;
    }
    dfs(nodes, edges, startNode) {
        const snapshots = [];
        const adj = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.source].push(e.target);
            adj[e.target].push(e.source);
        });
        const visited = new Set();
        const stack = [startNode];
        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [0],
            description: `Starting DFS from node ${startNode}`,
            variables: { stack: [...stack], visited: Array.from(visited) },
        });
        const runDfs = (u) => {
            visited.add(u);
            snapshots.push({
                dataStructureState: { nodes, edges },
                currentNodeId: u,
                highlightedLineIds: [1, 2],
                description: `Visiting node ${u}`,
                variables: { stack: [...stack], visited: Array.from(visited), visiting: u },
            });
            for (const v of adj[u]) {
                if (!visited.has(v)) {
                    snapshots.push({
                        dataStructureState: { nodes, edges },
                        currentNodeId: v,
                        highlightedLineIds: [3],
                        description: `Moving to neighbor ${v} of node ${u}`,
                        variables: { stack: [...stack], visited: Array.from(visited), neighbor: v },
                    });
                    runDfs(v);
                }
            }
        };
        runDfs(startNode);
        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [4],
            description: 'DFS traversal complete!',
            variables: { visited: Array.from(visited) },
        });
        return snapshots;
    }
    bfs(nodes, edges, startNode) {
        const snapshots = [];
        const adj = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.source].push(e.target);
            adj[e.target].push(e.source);
        });
        const visited = new Set();
        const queue = [startNode];
        visited.add(startNode);
        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [0],
            description: `Starting BFS from node ${startNode}`,
            variables: { queue: [...queue], visited: Array.from(visited) },
        });
        while (queue.length > 0) {
            const u = queue.shift();
            snapshots.push({
                dataStructureState: { nodes, edges },
                currentNodeId: u,
                highlightedLineIds: [1],
                description: `De-queueing node ${u}`,
                variables: { queue: [...queue], visited: Array.from(visited), visiting: u },
            });
            for (const v of adj[u]) {
                if (!visited.has(v)) {
                    visited.add(v);
                    queue.push(v);
                    snapshots.push({
                        dataStructureState: { nodes, edges },
                        currentNodeId: v,
                        highlightedLineIds: [2],
                        description: `Found unvisited neighbor ${v}, adding to queue`,
                        variables: { queue: [...queue], visited: Array.from(visited), neighbor: v },
                    });
                }
            }
        }
        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [3],
            description: 'BFS traversal complete!',
            variables: { visited: Array.from(visited) },
        });
        return snapshots;
    }
}
exports.GraphEngine = GraphEngine;
