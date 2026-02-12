"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sorting_1 = require("../engines/sorting");
const searching_1 = require("../engines/searching");
const graph_1 = require("../engines/graph");
const tree_1 = require("../engines/tree");
const dp_1 = require("../engines/dp");
const router = (0, express_1.Router)();
const sortingEngine = new sorting_1.SortingEngine();
const searchingEngine = new searching_1.SearchingEngine();
const graphEngine = new graph_1.GraphEngine();
const treeEngine = new tree_1.TreeEngine();
const dpEngine = new dp_1.DPEngine();
const ALGORITHMS = [
    {
        id: 'bubble-sort',
        name: 'Bubble Sort',
        category: 'sorting',
        complexity: { time: 'O(n^2)', space: 'O(1)' },
        description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        pseudoCode: ['for i in 0..n-1:', '  for j in 0..n-i-2:', '    if arr[j] > arr[j+1]:', '      swap(arr[j], arr[j+1])']
    },
    {
        id: 'quick-sort',
        name: 'Quick Sort',
        category: 'sorting',
        complexity: { time: 'O(n log n)', space: 'O(log n)' },
        description: 'Divides array into smaller arrays using a pivot, then recursively sorts them.',
        pseudoCode: ['pivot = partition(arr, low, high)', 'quickSort(arr, low, pivot-1)', 'quickSort(arr, pivot+1, high)']
    },
    {
        id: 'binary-search',
        name: 'Binary Search',
        category: 'searching',
        complexity: { time: 'O(log n)', space: 'O(1)' },
        description: 'Efficiently find an item from a sorted list by repeatedly halving the search interval.',
        pseudoCode: ['left=0, right=n-1', 'while l <= r:', '  mid = (l+r)/2', '  if arr[mid] == target: return mid', '  else if arr[mid] < target: l = mid+1', '  else: r = mid-1']
    },
    {
        id: 'dfs',
        name: 'DFS',
        category: 'graph',
        complexity: { time: 'O(V+E)', space: 'O(V)' },
        description: 'Explores as far as possible along each branch before backtracking.',
        pseudoCode: ['DFS(u):', '  visited[u] = true', '  for v in adj[u]:', '    if !visited[v]: DFS(v)']
    },
    {
        id: 'bfs',
        name: 'BFS',
        category: 'graph',
        complexity: { time: 'O(V+E)', space: 'O(V)' },
        description: 'Explores all neighbor nodes at the present depth before moving to nodes at the next depth level.',
        pseudoCode: ['BFS(start):', '  q.push(start)', '  while !q.empty:', '    u = q.pop()', '    for v in adj[u]: if !visited[v]: q.push(v)']
    },
    {
        id: 'bst-insert',
        name: 'BST Insertion',
        category: 'tree',
        complexity: { time: 'O(h)', space: 'O(h)' },
        description: 'Inserts a value into a Binary Search Tree while maintaining the BST property.',
        pseudoCode: ['if root == null: root = node(val)', 'else if val < curr.val: insert(curr.left, val)', 'else: insert(curr.right, val)']
    },
    {
        id: 'dijkstra',
        name: 'Dijkstra',
        category: 'graph',
        complexity: { time: 'O((V+E) log V)', space: 'O(V)' },
        description: 'Finds the shortest paths between nodes in a graph.',
        pseudoCode: ['dist[s] = 0', 'while pq:', '  u = pq.pop_min()', '  for v, w in adj[u]: relax(u, v, w)']
    },
    {
        id: 'knapsack',
        name: '0/1 Knapsack',
        category: 'dp',
        complexity: { time: 'O(nW)', space: 'O(nW)' },
        description: 'Determines the most valuable combination of items that fit in a knapsack.',
        pseudoCode: ['for i in 1..n:', '  for w in 1..W:', '    if wt[i-1] <= w: dp[i][w] = max(val[i-1]+dp[i-1][w-wt], dp[i-1][w])', '    else: dp[i][w] = dp[i-1][w]']
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
        if (id === 'bubble-sort')
            result = sortingEngine.execute({ type: 'bubbleSort', data });
        else if (id === 'quick-sort')
            result = sortingEngine.execute({ type: 'quickSort', data });
        else if (id === 'binary-search')
            result = searchingEngine.execute({ type: 'binarySearch', data, target });
        else if (id === 'dfs')
            result = graphEngine.execute({ type: 'dfs', nodes, edges, startNode });
        else if (id === 'bfs')
            result = graphEngine.execute({ type: 'bfs', nodes, edges, startNode });
        else if (id === 'dijkstra')
            result = graphEngine.execute({ type: 'dijkstra', nodes, edges, startNode });
        else if (id === 'bst-insert')
            result = treeEngine.execute({ type: 'bstInsert', nodes, value });
        else if (id === 'knapsack')
            result = dpEngine.execute({ type: 'knapsack', weights, values, capacity });
        else
            return res.status(404).json({ error: 'Algorithm not found' });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
