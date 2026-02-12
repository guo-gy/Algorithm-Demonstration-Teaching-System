import { AlgorithmSnapshot } from '@shared/types';
import { AlgorithmEngine } from './base';

export class GraphEngine extends AlgorithmEngine {
    execute(input: { type: string; nodes: any[]; edges: any[]; startNode: string | number }): AlgorithmSnapshot[] {
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

    private dijkstra(nodes: any[], edges: any[], startNode: string | number): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const adj: Record<string | number, { node: string | number, weight: number }[]> = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.source].push({ node: e.target, weight: e.weight || 1 });
            adj[e.target].push({ node: e.source, weight: e.weight || 1 });
        });

        const distances: Record<string | number, number> = {};
        const previous: Record<string | number, string | number | null> = {};
        const pq: { node: string | number, dist: number }[] = [];

        nodes.forEach(n => {
            distances[n.id] = Infinity;
            previous[n.id] = null;
        });

        distances[startNode] = 0;
        pq.push({ node: startNode, dist: 0 });

        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [0],
            description: 'dijkstra_start',
            variables: { distances: { ...distances }, pq: [...pq], startNode },
        });

        while (pq.length > 0) {
            pq.sort((a, b) => a.dist - b.dist);
            const { node: u, dist } = pq.shift()!;

            if (dist > distances[u]) continue;

            snapshots.push({
                dataStructureState: { nodes, edges },
                currentNodeId: u,
                highlightedLineIds: [1],
                description: 'dijkstra_extracting_min',
                variables: { distances: { ...distances }, pq: [...pq], visiting: u, dist },
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
                        description: 'dijkstra_relaxing_edge',
                        variables: { distances: { ...distances }, pq: [...pq], u, v, alt },
                    });
                }
            }
        }

        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [3],
            description: 'dijkstra_complete',
            variables: { distances: { ...distances } },
        });
        return snapshots;
    }

    private dfs(nodes: any[], edges: any[], startNode: string | number): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const adj: Record<string | number, (string | number)[]> = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.source].push(e.target);
            adj[e.target].push(e.source);
        });

        const visited = new Set<string | number>();
        const stack: (string | number)[] = [startNode];

        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [0],
            description: 'dfs_start',
            variables: { stack: [...stack], visited: Array.from(visited), startNode },
        });

        const runDfs = (u: string | number) => {
            visited.add(u);
            snapshots.push({
                dataStructureState: { nodes, edges },
                currentNodeId: u,
                highlightedLineIds: [1, 2],
                description: 'dfs_visiting',
                variables: { stack: [...stack], visited: Array.from(visited), visiting: u },
            });

            for (const v of adj[u]) {
                if (!visited.has(v)) {
                    snapshots.push({
                        dataStructureState: { nodes, edges },
                        currentNodeId: v,
                        highlightedLineIds: [3],
                        description: 'dfs_moving_to_neighbor',
                        variables: { stack: [...stack], visited: Array.from(visited), u, v },
                    });
                    runDfs(v);
                }
            }
        };

        runDfs(startNode);
        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [4],
            description: 'dfs_complete',
            variables: { visited: Array.from(visited) },
        });
        return snapshots;
    }

    private bfs(nodes: any[], edges: any[], startNode: string | number): AlgorithmSnapshot[] {
        const snapshots: AlgorithmSnapshot[] = [];
        const adj: Record<string | number, (string | number)[]> = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.source].push(e.target);
            adj[e.target].push(e.source);
        });

        const visited = new Set<string | number>();
        const queue: (string | number)[] = [startNode];
        visited.add(startNode);

        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [0],
            description: 'bfs_start',
            variables: { queue: [...queue], visited: Array.from(visited), startNode },
        });

        while (queue.length > 0) {
            const u = queue.shift()!;
            snapshots.push({
                dataStructureState: { nodes, edges },
                currentNodeId: u,
                highlightedLineIds: [1],
                description: 'bfs_dequeueing',
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
                        description: 'bfs_neighbor_found',
                        variables: { queue: [...queue], visited: Array.from(visited), neighbor: v },
                    });
                }
            }
        }

        snapshots.push({
            dataStructureState: { nodes, edges },
            highlightedLineIds: [3],
            description: 'bfs_complete',
            variables: { visited: Array.from(visited) },
        });
        return snapshots;
    }
}
