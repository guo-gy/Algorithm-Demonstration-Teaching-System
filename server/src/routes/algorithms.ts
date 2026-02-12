import { Router, Request, Response } from 'express';
import { SortingEngine } from '../engines/sorting';
import { SearchingEngine } from '../engines/searching';
import { GraphEngine } from '../engines/graph';
import { TreeEngine } from '../engines/tree';
import { DPEngine } from '../engines/dp';
import { AlgorithmMetaData } from '@shared/types';

const router = Router();
const sortingEngine = new SortingEngine();
const searchingEngine = new SearchingEngine();
const graphEngine = new GraphEngine();
const treeEngine = new TreeEngine();
const dpEngine = new DPEngine();

const ALGORITHMS: AlgorithmMetaData[] = [
    {
        id: 'bubble-sort',
        name: 'bubble_sort',
        category: 'sorting',
        complexity: { time: 'O(n^2)', space: 'O(1)' },
        description: 'bubble_sort_desc',
        pseudoCode: ['for i from 0 to n-1:', '  for j from 0 to n-i-2:', '    if arr[j] > arr[j+1]:', '      swap(arr[j], arr[j+1])']
    },
    {
        id: 'quick-sort',
        name: 'quick_sort',
        category: 'sorting',
        complexity: { time: 'O(n log n)', space: 'O(log n)' },
        description: 'quick_sort_desc',
        pseudoCode: ['pivot = partition(arr, low, high)', 'quickSort(arr, low, pivot-1)', 'quickSort(arr, pivot+1, high)']
    },
    {
        id: 'binary-search',
        name: 'binary_search',
        category: 'searching',
        complexity: { time: 'O(log n)', space: 'O(1)' },
        description: 'binary_search_desc',
        pseudoCode: ['left=0, right=n-1', 'while left <= right:', '  mid = (left+right)/2', '  if arr[mid] == target: return mid', '  else if arr[mid] < target: left = mid+1', '  else: right = mid-1']
    },
    {
        id: 'dfs',
        name: 'dfs',
        category: 'graph',
        complexity: { time: 'O(V+E)', space: 'O(V)' },
        description: 'dfs_desc',
        pseudoCode: ['DFS(u):', '  visited[u] = true', '  for each neighbor v of u:', '    if !visited[v]: DFS(v)']
    },
    {
        id: 'bfs',
        name: 'bfs',
        category: 'graph',
        complexity: { time: 'O(V+E)', space: 'O(V)' },
        description: 'bfs_desc',
        pseudoCode: ['BFS(start):', '  queue.enqueue(start)', '  while queue not empty:', '    u = queue.dequeue()', '    for neighbor v of u: if !visited[v]: queue.enqueue(v)']
    },
    {
        id: 'bst-insert',
        name: 'bst_insert',
        category: 'tree',
        complexity: { time: 'O(h)', space: 'O(h)' },
        description: 'bst_insert_desc',
        pseudoCode: ['if root == null: root = newNode(val)', 'else if val < curr.val: insert(curr.left, val)', 'else: insert(curr.right, val)']
    },
    {
        id: 'dijkstra',
        name: 'dijkstra',
        category: 'graph',
        complexity: { time: 'O((V+E) log V)', space: 'O(V)' },
        description: 'dijkstra_desc',
        pseudoCode: ['dist[start] = 0', 'while pq not empty:', '  u = pq.extractMin()', '  for each neighbor v of u: relax(u, v, weight)']
    },
    {
        id: 'knapsack',
        name: 'knapsack',
        category: 'dp',
        complexity: { time: 'O(nW)', space: 'O(nW)' },
        description: 'knapsack_desc',
        pseudoCode: ['for i from 1 to n:', '  for w from 1 to W:', '    if weight[i-1] <= w: dp[i][w] = max(val[i-1]+dp[i-1][w-weight], dp[i-1][w])', '    else: dp[i][w] = dp[i-1][w]']
    }
];

router.get('/', (req, res) => {
    res.json(ALGORITHMS);
});

router.post('/:id/execute', (req, res) => {
    const { id } = req.params;
    const { data, target, startNode, weights, values, capacity, nodes, edges, value } = req.body;

    try {
        let result;
        if (id === 'bubble-sort') result = sortingEngine.execute({ type: 'bubbleSort', data });
        else if (id === 'quick-sort') result = sortingEngine.execute({ type: 'quickSort', data });
        else if (id === 'binary-search') result = searchingEngine.execute({ type: 'binarySearch', data, target });
        else if (id === 'dfs') result = graphEngine.execute({ type: 'dfs', nodes, edges, startNode });
        else if (id === 'bfs') result = graphEngine.execute({ type: 'bfs', nodes, edges, startNode });
        else if (id === 'dijkstra') result = graphEngine.execute({ type: 'dijkstra', nodes, edges, startNode });
        else if (id === 'bst-insert') result = treeEngine.execute({ type: 'bstInsert', nodes, value });
        else if (id === 'knapsack') result = dpEngine.execute({ type: 'knapsack', weights, values, capacity });
        else return res.status(404).json({ error: 'Algorithm not found' });

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
